
import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";
import User from "../models/userModel.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";

// New appointment => /api/v1/appointment/newconsult POST*****
export const createAppointmentPat = catchAsyncErrors(async (req, res, next) => {
    const { doctor, appointmentDate, appointmentTime, appointmentType, notes } = req.body;
  //Frontend: Ensure the dates dispalayed to the user are a subset of doctor's available hours

    // validate input Date data
    const currentDate = Date.now();
    const targetDate = new Date(appointmentTime.start);
    if (appointmentTime.start < currentDate) {
        return next(new ErrorHandler("Selected start date cannot be in the past", 400));
    }

    if (appointmentTime.end <= appointmentTime.start) {
        return next(new ErrorHandler("Selected end date/time must be greater than start date/time", 400));
    }
    let count = 0;
  // fetch the specified doctor's active appointment list that coincides with the date
    const appointmentList = await Appointment.find({
      $and: [
        {
          doctor: doctor
        },
        {
          status: "active"
        },
        {
          $expr: {
            $and: [
              { $eq: [ { $year: "$appointmentDate" }, { $year: targetDate } ] },
              { $eq: [ { $month: "$appointmentDate" }, { $month: targetDate } ] },
              { $eq: [ { $dayOfMonth: "$appointmentDate" }, { $dayOfMonth: targetDate } ] }
            ]
          }
        },
      ]
    }).exec();
    
    appointmentList.forEach((appointment) => 
    {  
      console.log(appointment);
      if (appointmentTime.start >= appointment.end) // new date before existing
      {
        count = 0;
        console.log(`apptT.s ==> ${appointmentTime.start} >>== app.e${appointment.end}`);
      } else if (appointmentTime.end <= appointment.start) // new date after existing
      {
        count = 0;
        console.log(`apptT.s ==> ${appointmentTime.start} >>== app.e ${appointment.end}`);
      }
      else 
      {
        console.log(`apptT.s ==> ${appointmentTime.start} >>== app.e${appointment.end}`);
        count = count + 1;
      }
     });
    //   {
    //     count = 0;
    //     console.log(`apptT.s ==> ${appointmentTime.start} >>== app.e${{appointment.end}`);
    //   } else {

    //     console.log(`apptT.s ==> ${appointmentTime.start} >>== app.e${appointment.end}`);
    //     count = count + 1;
    // });


    const doctorProfile = await Doctor.findById(doctor);
    const dmail = doctorProfile.email;

    console.log(`na patient email be dis: ${dmail}`);

    if (!appointmentList)
    {
      const appointment = await Appointment.create({
        linkedto: req.user.id,
        doctor,
        appointmentDate,
        appointmentTime,
        appointmentType,
        notes,
        umail: req.user.email,
        dmail: dmail,
      });

      if (!appointment) {
        return next(new ErrorHandler("Appointment could not be created", 400));
      }

      // return successful response
      res.status(201).json({
        success: true,
        message: "Appointment created succesfully!",
        appointment,
      });
      
    } else { // If the doctor has active appointments

      console.log("DOCTOR GET SOME ACTIVE APPOINTMENTS ON THAT DATE");

    // check if the doctor is already booked for user selected time period 
      // let count = 0;
      // const execApp = appointmentList
      //console.log(`Count is ${count} and list contains ${appointmentList}`);
      
  
      if (count === 0) // If there are no time-clashing appointments
      {
        const appointment = await Appointment.create({
          linkedto:req.user.id,
          doctor,
          appointmentDate,
          appointmentTime,
          appointmentType,
          notes,
          umail: req.user.email,
          dmail: dmail,
        });
  
        if (!appointment) {
          return next(new ErrorHandler("Appointment could not be created", 400));
        }
  
        // return successful response
        res.status(201).json({
          success: true,
          message: "Appointment created succesfully!",
          appointment,
        });

      } 
      else { // Selected time has appointment clashing
        console.log(`Doctor ${ doctor } is already booked for this time window, kindly select another time or date`);
        res.status(400).json({
          success: true,
          message: `Doctor ${ doctor } is already booked for this time window, kindly select another time or date`,
        });
      }
    }
});

// **************************************************************************************************************************************************

// New appointment => /api/v1/appointment/newfollowup POST*****
export const createAppointmentDoc = catchAsyncErrors(async (req, res, next) => {
  const { patientId, appointmentDate, appointmentTime, appointmentType, notes } = req.body;

// validate input data
  const currentDate = Date.now;
  const targetDate = new Date(appointmentTime.start);
  if (appointmentTime.start < currentDate) {
      return next(new ErrorHandler("Selected start date cannot be in the past", 400));
  }

  if (appointmentTime.end <= appointmentTime.start) {
      return next(new ErrorHandler("Selected end date/time must be greater than start date/time", 400));
  }
  console.log("I DON VALIDATE START & END DATES");

  console.log("I DON FIND Patient LIST");
// logic for checking availability of selected date before appointment creation goes here

// fetch the specified User's active appointment list for the selected Date (Day)
  const appointmentList = await Appointment.find({
    $and: [
      {
        linkedto: patientId
      },
      {
        status: "active"
      },
      {
        $expr: {
          $and: [
            { $eq: [ { $year: "$appointmentDate" }, { $year: targetDate } ] },
            { $eq: [ { $month: "$appointmentDate" }, { $month: targetDate } ] },
            { $eq: [ { $dayOfMonth: "$appointmentDate" }, { $dayOfMonth: targetDate } ] }
          ]
        }
      },
    ]
  });

  //console.log("I DON FIND SAME DATE LIST");
  //console.log(`Na hin be dis: ${appointmentList}`); 
  //return next(new ErrorHandler("Na here you say make I end", 400));

  const patient = await User.findById(patientId);
  const pmail = patient.email;

  console.log(`na patient email be dis: ${pmail}`);

  if (!appointmentList)
  {
    const appointment = await Appointment.create({
      linkedto: patientId,
      doctor: req.user.id,
      appointmentDate,
      appointmentTime,
      appointmentType,
      notes,
      umail: pmail,
      dmail: req.user.email,
    });

    if (!appointment) {
      return next(new ErrorHandler("Appointment could not be created", 400));
    }

    // return successful response
    res.status(201).json({
      success: true,
      message: "Appointment created succesfully!",
      appointment,
    });
    
  } else { // If the User has active appointments

    console.log("PATIENT GET SOME ACTIVE APPOINTMENTS ON THAT DATE");

  // check if the User has appointment scheduled for the Doctor selected time period 
    let count = 0;
    appointmentList.forEach(appointment => {
      
      if (appointment.end <= appointmentTime.start) // new date before existing
      {
        count = 0;
      } else if (appointmentTime.start >= appointment.end) // new date after existing
      {
        count = 0;
      } else 
      {
        count = count + 1;
      }
    });

    if (count === 0) // No time-clashing appointments
    {
      const appointment = await Appointment.create({
        linkedto: patientId,
        doctor: req.user.id,
        appointmentDate,
        appointmentTime,
        appointmentType,
        notes,
        umail: pmail,
        dmail: req.user.email,
      });

      if (!appointment) {
        return next(new ErrorHandler("Appointment could not be created", 400));
      }

      // return successful response
      res.status(201).json({
        success: true,
        message: `Appointment with User ${patientId} created succesfully!`,
        appointment,
      });

    } 
    else { // Selected time has appointment 
      console.log(`The User ${patientId} has an appointment for this time window, kindly select another time or date`);
      res.status(400).json({
        success: true,
        message: `The User ${patientId} has an appointment for this time window, kindly select another time or date`
      });
    }
  }
});

//#################################################################################################################################################################

  // All appointments => /api/v1/appointment/all GET*****
// Get all Appointments linked to current user 'request by user'
export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
  let message = '';
  const currentUser = req.user.id; // get the current logged-in user
  const cursor_count = await Appointment.count({ linkedto: currentUser });
  const appointments = await Appointment.find({ linkedto: currentUser }, 
    { umail: 0, dmail: 0, linkedto: 0, 
      doctor: {phone: 0, availableHrs: 0}, 
      createdAt: 0, __v: 0 
    });
  // frontend should render or display the above appointment data in a numbered list or table. 
  
  if (cursor_count === 0) 
  {
    message = "You don't have any appointments";
  }
  
  if (!appointments) {
    return next(new ErrorHandler("Error getting the appointments", 400));
  }

  res.status(200).json({
    success: true,
    message: message,
    appointments,
  });
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

// All appointments => /api/v1/appointment/all/active GET*****
export const getAllActiveAppointments = catchAsyncErrors(async (req, res, next) => {

  let message; // variable to store messages 
  const currentUser = req.user.id; // get the current logged-in user

  const cursor_count = await Appointment.count({ linkedto: currentUser, status: 'active' });
  const appointments = await Appointment.find({ linkedto: currentUser, status: 'active'}, 
    { umail: 0, dmail: 0, linkedto: 0, 
      doctor: {phone: 0, availableHrs: 0}, 
      createdAt: 0, __v: 0 
    });
  // frontend should render or display the above appointment data in a numbered list or table. 
  
  if (cursor_count === 0)
  {
    message = "You don't have any  active appointments";
  }

  if (!appointments) {
    return next(new ErrorHandler("Cannot retrieve your active appointments", 400));
  }
  res.status(200).json({
    success: true,
    message: message,
    appointments,
  });
});

// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

// All appointments => /api/v1/appointment/all/cancelled GET*****
export const getAllCancelledAppointments = catchAsyncErrors(async (req, res, next) => {

  let message; // variable to store messages 
  const currentUser = req.user.id; // get the current logged-in user

  const cursor_count = await Appointment.count({ linkedto: currentUser, status: 'cancelled' });
  const appointments = await Appointment.find({ linkedto: currentUser, status: 'cancelled'}, 
    { umail: 0, dmail: 0, linkedto: 0, 
      doctor: {phone: 0, availableHrs: 0}, 
      createdAt: 0, __v: 0 
    });
  // frontend should render or display the above appointment data in a numbered list or table. 
  
  if (cursor_count === 0)
  {
    message = "You don't have any cancelled appointments";
  }

  if (!appointments) {
    return next(new ErrorHandler("Cannot retrieve your cancelled appointments", 400));
  }
  res.status(200).json({
    success: true,
    message: message,
    appointments,
  });
});

//&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

// Get all appointments linked to a specific doctor 'request made only by doctors'
// Get => /api/v1/appointment/patients/all  GET*****
export const getAllPatientAppointments = catchAsyncErrors(async (req, res, next) => {

  let message;
  const currentUser = req.user.id; // get the current logged-in user

  const asoc_doc = await Doctor.findOne({linkedto: currentUser}); // get the doctor associated with the request
  const cursor_count = await Appointment.count({doctor: asoc_doc}); // get the number of DB appointment entries with the Doctor
  const appointments = await Appointment.find({doctor: asoc_doc}); // get the appointments associated with the Doctor

  if (cursor_count === 0) {
    message = "You do not have patient appointments";
  }

  if (!appointments) {
    return next(new ErrorHandler("Unable to retrieve your patient appointments", 400));
  }

  // frontend should render or display in the below appointment data in a numbered list or table. 

  res.status(200).json({
    success: true,
    message: message,
    appointments,
  });
});

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

// Get single appointment by ID => /api/v1/appointment/:id  GET*****
export const getAppointment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const cursor_count = await Appointment.count({ _id: id , linkedto: req.user.id});
  const appointment = await Appointment.find({ _id: id , linkedto: req.user.id},
    { umail: 0, dmail: 0, linkedto: 0, 
      doctor: {phone: 0, availableHrs: 0}, 
      createdAt: 0, __v: 0 
    });

  if (cursor_count === 0) {
    message = `Specified appointment: '${id}' does not exist`;
  }
  
  if (!appointment) {
    return next(new ErrorHandler('Error while retrieving the appointment', 404));
  }

  res.status(200).json({
    success: true,
    message: message,
    appointment,
  });
});

//##############################################################################################################################

  // Update appointment => /api/v1/appointment/update/:id PUT****
export const updateAppointment = catchAsyncErrors(async (req, res, next) => {
    let allFree;
    const { id } = req.params;
    const { appointmentDate, appointmentTime, appointmentType, notes } = req.body;

//  validate input data
    const currentDate = Date.now;
    const targetDate = new Date(appointmentTime.start);
    if (appointmentTime.start < currentDate) {
      return next(new ErrorHandler("Selected start date cannot be in the past", 400));
    }

    if (appointmentTime.end <= appointmentTime.start) {
      return next(new ErrorHandler("Selected end date/time must be greater than start date/time", 400));
    }
    console.log("I DON VALIDATE START & END DATES");

    const userRole = req.user.role;
    
    // if the user is a doctor or patient, check if active appointment exists and update 
    if (userRole === "doctor")
    {
      //const thisdoct = Doctor.findOne({_id: req.user.doctor_id});
      const query = { doctor: req.user.doctor_id, status: "active" };

      // fetch the specified doctor's appointment list
      const appointments = await Appointment.find(query);
      if (!appointments) {
        allFree = true;
        return next(new ErrorHandler("You don't have any active appointments", 400));
      }
    }

    if (userRole === "user")
    {
      const appt = await Appointment.findById(id);
      const thisDoctor = appt.doctor;
      const query = { doctor: thisDoctor, status: "active" };

      // fetch the specified doctor's appointment list
      //const appDoctor = await Appointment.find(query);

      const appointment = await Appointment.find(query);

      if (!appointment) {
        allFree = true;
        return next(new ErrorHandler("You don't have any active appointments", 400));
      }
    }

  // Logic for checking available dates before updating appointment goes here:
    // check if the doctor/user is already booked for user selected period
    if (!allFree)
    {    
           // fetch the specified doctor's active appointment list that coincides with the date
      const appointmentList = await Appointment.find({
        $and: [
          {
            doctor: thisDoctor
          },
          {
            status: "active"
          },
          {
            $expr: {
              $and: [
                { $eq: [ { $year: "$appointmentDate" }, { $year: targetDate } ] },
                { $eq: [ { $month: "$appointmentDate" }, { $month: targetDate } ] },
                { $eq: [ { $dayOfMonth: "$appointmentDate" }, { $dayOfMonth: targetDate } ] }
              ]
            }
          },
        ]
      });

      const doctorProfile = await Doctor.findById(thisDoctor);
      const dmail = doctorProfile.email;

      console.log(`na doctor email be dis: ${dmail}`);

      if (!appointmentList)
      {
        const update = {
          appointmentDate,
          appointmentTime,
          appointmentType,
          notes,
        };
        const appointment = await Appointment.FindByIdAndUpdate({id, update 
        });

        if (!appointment) {
          return next(new ErrorHandler("Appointment could not be created", 400));
        }

        // return successful response
        res.status(201).json({
          success: true,
          message: "Appointment created succesfully!",
          appointment,
        });
        
      } else { // If the doctor has active appointments

        // check if the doctor is already booked for user selected time period 
        let count = 0;
        appointmentList.forEach(appointment => {
          
          if (appointment.end <= appointmentTime.start) // new date before existing
          { count = 0;
          } else if (appointmentTime.start >= appointment.end) // new date after existing
          { count = 0;
          } else {
            count = count + 1;
          }
        });
      }
    
        if (count === 0) // No time-clashing appointments
        {
          const update = {
            appointmentDate,
            appointmentTime,
            appointmentType,
            notes,
          };
          const appointment = await Appointment.FindByIdAndUpdat({id, update});
    
          if (!appointment) {
            return next(new ErrorHandler("Appointment could not be created", 400));
          }
    
          // return successful response
          res.status(201).json({
            success: true,
            message: "Appointment created succesfully!",
            appointment,
          });
        } else { // Selected time has appointment 
          console.log(`Doctor ${ doctor } is already booked for this time window, kindly select another time or date`);
          res.status(400).json({
            success: true,
            message: `Doctor ${ doctor } is already booked for this time window, kindly select another time or date`,
          });
        }
      }
  });

  
// =====================================================================================================================================

  // Delete appointment => /api/v1/appointment/:id PUT****
  export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
  
    // check if appointment belongs to user
    const appointment = await Appointment.find({ _id: id , linkedto: req.user.id},)
    //const appointment = await Appointment.findById(id); --- onld code

    // does appointment exist?
    if (!appointment) {
      return next(new ErrorHandler("Specified appointment does not exist for this user", 404));
    }

    // is appointment active?
    if (appointment.status === "active") {
      return next(new ErrorHandler("you cannot delete an active appointment, cancel it first", 400));
    }

    Appointment.findByIdAndDelete(id); // delete the specified appointment
  
    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  });

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  // Cancel Appointment => /api/v1/appointment/:id PUT****
  export const cancelAppointment = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
  
    const update = {
      status: "cancelled",
      data: id,
  };

  const appointment = await Appointment.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })
    .populate("status");

    if (!appointment) {
      return next(new ErrorHandler("Specified appointment does not exist", 404));
    }
      
    
    // Inform user of cancelled appointment by doctor
    const cancelledApp = await Appointment.findOne({_id: id}); // find Appointment
    const user = await User.findOne({_id: cancelledApp.linkedto}); // fetch user
    const mailOptions = {
      from: 'schedg23@gmail.com',
      to: cancelledApp.dmail,
      subject: `Reminder: ${cancelledApp.appointmentType} Appointment with Doctor ${ cancelledApp.doctor.name}`,
      text: `Hello ${user.name},\n\nThis is a reminder that your appointment with Doctor ${cancelledApp.doctor.name} on ${cancelledApp.appointmentDate} has been cancelled.\n\nThank you,\nSchedG Telehealth.`
    };
    
    // Send the Email.
    mail_transporter.sendmail(mailOptions, function(error, info){
      if (error) {
      console.log(error);
      } else {
      console.log('Reminder email sent: ' + info.response);
    }
    });

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
    });
  });


// ########################################################################################################################
// Add code to reset an appointment immediately its time lapses.


  // Inform user of cancelled appointment by doctor
// const mailOptions = {
//   from: 'schedg23@gmail.com',
//   to: cancelledApp.linkedto.email,
//   subject: `Reminder: ${cancelledApp.appointmentType} Appointment with Doctor ${ cancelledApp.doctor.name}`,
//   text: `Hello ${cancelledApp.linkedto.name},\n\nThis is a reminder that your appointment with Doctor ${cancelledApp.doctor.name} at ${cancelledApp.appointmentDate} has been cancelled.\n\nThank you,\nSchedG Telehealth.`
// };

// mail_transporter.senpmail(mailOptions, function(error, info){
//   if (error) {
//   console.log(error);
//   } else {
//   console.log('Reminder email sent: ' + info.response);
// }
// });

// // Function to inform doctors/patients of cancelled appointments => /api/v1/register-as-doctor *****
// export const remPatCancel = catchAsyncErrors(async (req, res, next) => {
//     const { phone, specialty, yearsExp, consultFee, availableHrs } = req.body;
  

//     // Check if any doctor is linked to the user account
//     const isDoctor = await Doctor.findOne( { linkedto: req.user.id } );
// });