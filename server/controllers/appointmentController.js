
import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";
import User from "../models/userModel.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { mail_transporter } from "../controllers/reminderController.js";

let mailOptions; // initialize mailOptions 

// New appointment => /api/v1/appointment/newconsult POST*****
export const createAppointmentPat = catchAsyncErrors(async (req, res, next) => {
    const { doctor, appointmentTime, appointmentType, notes } = req.body;
    let count = 0; 

  //Frontend: Ensure the dates displayed to the user to pick from are a subset of doctor's available hours

    // validate input Date data
    const newStart = new Date(appointmentTime.start);
    const newEnd = new Date(appointmentTime.end);
   
    const currentDate = new Date();

    if (newStart.getTime() < currentDate.getTime()) {
        return next(new ErrorHandler("Selected start date cannot be in the past", 400));
    }

    if (newEnd.getTime() <= newStart.getTime()) {
        return next(new ErrorHandler("Selected end date / time must be greater than start date / time", 400));
    }

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
              { $eq: [ { $year: "$appointmentDate" }, { $year: newStart } ] },
              { $eq: [ { $month: "$appointmentDate" }, { $month: newStart } ] },
              { $eq: [ { $dayOfMonth: "$appointmentDate" }, { $dayOfMonth: newStart } ] }
            ]
          }
        },
      ]
    }).exec();

    appointmentList.forEach((appointment) =>
    {  
      //console.log(appointment);
      if (newStart.getTime() >= (appointment.appointmentTime[0].end).getTime()) // new date later than end of existing
      {
        count = 0;
      } else if (newEnd.getTime() <= (appointment.appointmentTime[0].start).getTime()) // new date earlier than end of existing
      {
        count = 0;
        console.log(`apptT.s ==> ${typeof(newStart)} | app.end=> ${typeof(appointment.appointmentTime[0].end)} | count => ${count}`);
      }
      else 
      {
        count = count + 1;
      }
     });


    const doctorProfile = await Doctor.findById(doctor);
    const dmail = doctorProfile.email;

    if (!appointmentList)
    {
      const appointment = await Appointment.create({
        linkedto: req.user.id,
        doctor,
        appointmentDate: appointmentTime.start,
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
      
  
      if (count == 0) // If there are no time-clashing appointments
      {
        const appointment = await Appointment.create({
          linkedto:req.user.id,
          doctor,
          appointmentDate: appointmentTime.start,
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
        //console.log(`Doctor ${ doctor } is already booked for this time window, kindly select another time or date`);

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
  const { patientId, appointmentTime, appointmentType, notes } = req.body;
  let count = 0;

// validate input data

  const newStart = new Date(appointmentTime.start);
  const newEnd = new Date(appointmentTime.end);
  const currentDate = new Date();
  
  if (newStart.getTime() < currentDate.getTime()) {
      return next(new ErrorHandler("Selected start date cannot be in the past", 400));
  }

  if (newEnd.getTime() <= newStart.getTime()) {
      return next(new ErrorHandler("Selected end date / time must be greater than start date / time", 400));
  }

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
            { $eq: [ { $year: "$appointmentDate" }, { $year: newStart } ] },
            { $eq: [ { $month: "$appointmentDate" }, { $month: newStart } ] },
            { $eq: [ { $dayOfMonth: "$appointmentDate" }, { $dayOfMonth: newStart } ] }
          ]
        }
      },
    ]
  }).exec();

  appointmentList.forEach((appointment) =>
    {  
      //console.log(appointment);
      if (newStart.getTime() >= (appointment.appointmentTime[0].end).getTime()) // new date later than end of existing
      {
        count = 0;
      } else if (newEnd.getTime() <= (appointment.appointmentTime[0].start).getTime()) // new date earlier than end of existing
      {
        count = 0;
        console.log(`apptT.s ==> ${typeof(newStart)} | app.end=> ${typeof(appointment.appointmentTime[0].end)} | count => ${count}`);
      }
      else 
      {
        count = count + 1;
      }
     });

  //console.log("I DON FIND SAME DATE LIST");
  //console.log(`Na hin be dis: ${appointmentList}`); 
  //return next(new ErrorHandler("Na here you say make I end", 400));

  const patient = await User.findById(patientId);
  const pmail = patient.email; //test

  console.log(`na patient email be dis: ${pmail}`);

  if (!appointmentList)
  {
    const appointment = await Appointment.create({
      linkedto: patientId,
      doctor: req.user.id,
      appointmentDate: appointmentTime.start,
      appointmentTime,
      appointmentType,
      notes,
      umail: pmail,
      dmail: req.user.email,
    });

    if (!appointment) {
      return next(new ErrorHandler("Appointment could not be created", 500));
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
    if (count === 0) // No time-clashing appointments
    {
      const appointment = await Appointment.create({
        linkedto: patientId,
        doctor: req.user.id,
        appointmentDate: appointmentTime.start,
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
    } else { // Selected time has appointment 
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
  let message;
  const { id } = req.params;
  const cursor_count = await Appointment.count({ _id: id , linkedto: req.user.id});
  const appointment = await Appointment.find({ _id: id , linkedto: req.user.id},
    { umail: 0, dmail: 0, linkedto: 0, 
      doctor: {phone: 0, availableHrs: 0}, 
      createdAt: 0, __v: 0 
    });

  if (cursor_count === 0) {
    message = `Specified appointment: '${id}' does not exist`;
  } else {

    if (!appointment) {
      return next(new ErrorHandler('Error while retrieving the appointment', 404));
    }
    message = "appointment retrieval successful";
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
    const { appointmentTime, appointmentType, notes } = req.body;


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
          appointmentDate: appointmentTime.start,
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
            appointmentDate: appointmentTime.start,
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

  // check if appointment exists for current user
  const appointment = await Appointment.findOne({ _id: id, linkedto: req.user._id});

  // does appointment exist?
  if (!appointment) {
    return next(new ErrorHandler("Specified appointment does not exist", 404));
  }

  // is appointment active?
  if (appointment.status === "active") {
    return next(new ErrorHandler("you cannot delete an active appointment, cancel it first", 400));
  }

  await Appointment.findByIdAndDelete(id); // delete the specified appointment

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
  };

  if (req.user.isDoctor === true) // Called by Doctor
  {
    //check if specified appointment is linked to doctor
    const app = await Appointment.findById(id);
    if (app.dmail === req.user.email)
    {
      console.log('DOCTOR NI OOOOO');
      const appointment = await Appointment.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      })
        .populate("status");

      // Notify User of cancelled appointment by Doctor
      const cancelledApp = await Appointment.findOne({_id: id}); // fetch Appointment
      const user = await User.findOne({_id: cancelledApp.linkedto}); // fetch user
  
      mailOptions = {
        from: 'schedg23@gmail.com',
        to: cancelledApp.umail,
        subject: `Appointment Notification: ${cancelledApp.appointmentType} Appointment with Doctor ${req.user.name}`,
        text: `Hello ${user.name},\n\nThis is a reminder that your appointment with Dr. ${req.user.name} on ${cancelledApp.appointmentDate} has been cancelled.\n\nThank you,\nSchedG Telehealth.`
      };

      res.status(200).json({
        success: true,
        message: "Appointment cancelled succesfully",
      });

    }
    else {
      res.status(404).json({
        success: false,
        message: "The specified appointment does not exist on your appointments list",
      });
      return;
    }
  } else if (req.user.role === 'admin')
  { // Called By Admin
    console.log('ADMINISTRATOR NI OOOOO');

    const appointment = await Appointment.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    })
      .populate("status");
    
    // if appointment does not exist
    if (!appointment) {
      return next(new ErrorHandler("Specified appointment does not exist", 404));
    }

    res.status(200).json({
      success: true,
      message: "Appointment cancelled succesfully",
    });

  } else
  { // By General user (patient)
    
    //check if specified appointment is linked to current user
    const cancelledApp = await Appointment.findById(id); // fetch appointment

    if (cancelledApp.umail === req.user.email)
    {
      const appointment = await Appointment.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      })
        .populate("status");

      // Notify Doctor of cancelled appointment by User
      //const cancelledApp = await Appointment.findOne({_id: id}); // find Appointment
      const doctor = await Doctor.findOne({_id: cancelledApp.doctor._id}); // fetch doctor
      const userDoc = await User.findById(doctor.linkedto);
  
      mailOptions = {
        from: 'schedg23@gmail.com',
        to: cancelledApp.dmail,
        subject: `Appointment Notification: ${cancelledApp.appointmentType} Appointment with ${ req.user.name}`,
        text: `Hello Dr. ${userDoc.name},\n\nThis is a reminder that your appointment with ${req.user.name} on ${cancelledApp.appointmentDate} has been cancelled.\n\nThank you,\nSchedG Telehealth.`
      };

      res.status(200).json({
        success: true,
        message: "Appointment cancelled succesfully",
      });

    } else {
      res.status(404).json({
        success: false,
        message: "The specified appointment does not exist on your appointments list",
      });
      return;
    }

    // Send the Email Notification
    mail_transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        return new ErrorHandler(error, 500);
      } else {
      console.log('Reminder email sent: ' + info.response);
    }
    });
  }
});

//$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

// Update Appointment Status => /api/v1/appointment/:id PUT****
export const updateAppStatus = catchAsyncErrors(async (req, res, next) => {
  const update = {status: "expired"};

  const currentDate = Date.now();
  const appointmentList = await Appointment.find({status: "active"})
  
  const lister = appointmentList.forEach((app) => {

    if (app.appointmentTime[0].end <= currentDate){
      updater(app._id, {status: 'expired'});
    }
  });

  res.status(200).json({
    success: true,
    message: "Appointments refreshed successfully",
  });

});

// async function to update all the appointment db records
const updater = async (id, update) => {
  await Appointment.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })
}