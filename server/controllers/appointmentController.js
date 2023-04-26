
import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";
import User from "../models/userModel.js";
import AppointmentList from "../models/appointmentlistModel.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { authorizeRoles } from "../middlewares/auth.js";

/* ROUTES
getAppointment
getAllAppointments
createAppointment
deleteAppointment
updateAppointment
*/

// New appointment => /api/v1/appointment/new POST*****
export const createAppointment = catchAsyncErrors(async (req, res, next) => {
    const { doctor, appointmentDate, appointmentDuration, appointmentType, notes } = req.body;
    //Frontend: Ensure the dates dispalayed are a subset of doctor's available hours

  // logic for checking availability of selected date before creation goes here
    const query = { doctor: doctor };

    // fetch the specified doctor's appointment list
    app_list = await Appointment.find(query);

    if (!app_list) {

      const appointment = await Appointment.create({
        linkedto: req.user.id,
        doctor,
        appointmentDate,
        appointmentDuration,
        appointmentType,
        notes,
      });
  
      if (!appointment) {
        return next(new ErrorHandler("Appointment could not be created", 400));
      }
    
      res.status(201).json({
        success: true,
        message: "Appointment created succesfully!",
        appointment,
      });
      
    } else { // If the doctor has active appointments

      // check if the doctor is already booked for user selected period 
      const unavailable = app_list.find({ Appointment: { $elemMatch: { appointmentDate: appointmentDate, appointmentDuration: appointmentDuration} } },
          function (err, appointment) { 
              if (err) { 
                  console.error(err);
              return false;
              }
          }
      );
      
      if (!unavailable) {
          console.log(`Doctor ${ doctor.name } is already booked for that date, kindly select another date`);
          return;
      }

    }
});
  
  // All appointments => /api/v1/appointment/all GET*****
  // Get all Appointments linked to current user 'request by user'
  export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {

    const currentUser = req.user.id; // get the current logged-in user

    const appointments = await Appointment.find({ linkedto: currentUser }) // find appointments linked to the currentUser 
        .populate("doctor")
        .populate("appointmentType")
        .populate("appointmentDate")
        .populate("appointmentDuration")
        .populate("notes");
    // frontend should render or display the above appointment data in a numbered list or table. 
  
    res.status(200).json({
      success: true,
      data: appointments,
    });
  });

  // All appointments => /api/v1/appointment/all/active GET*****
  export const getAllActiveAppointments = catchAsyncErrors(async (req, res, next) => {

    const currentUser = req.user.id; // get the current logged-in user

    const appointments = await Appointment.find({ linkedto: currentUser, status: 'active' }) // find all active appointments linked to the currentUser 
        .populate("doctor")
        .populate("appointmentType")
        .populate("appointmentDate")
        .populate("appointmentDuration")
        .populate("notes");
    // frontend should render or display the above appointment data in a numbered list or table. 
  
    res.status(200).json({
      success: true,
      data: appointments,
    });
  });

  // All appointments => /api/v1/appointment/all/cancelled GET*****
  export const getAllCancelledAppointments = catchAsyncErrors(async (req, res, next) => {

    const currentUser = req.user.id; // get the current logged-in user

    const appointments = await Appointment.find({ linkedto: currentUser, status: 'cancelled' }) // find all cancelled appointments linked to the currentUser 
        .populate("doctor")
        .populate("appointmentType")
        .populate("appointmentDate")
        .populate("appointmentDuration")
        .populate("notes");
    // frontend should render or display the above appointment data in a numbered list or table. 
  
    res.status(200).json({
      success: true,
      data: appointments,
    });
  });

  // Get all appointments linked to a specific doctor 'request made only by doctors'
  // Get => /api/v1/appointment/patients/all  GET*****
  export const getAllPatientAppointments = catchAsyncErrors(async (req, res, next) => {

    const currentUser = req.user.id; // get the current logged-in user

    const asoc_doc = await Doctor.find({linkedto: currentUser}); // get the doctor associated with the request
    const cursor_count = await Appointment.count({_id: asoc_doc}); // get the number of DB appointment entries with the Doctor
    const appointments = await Appointment.find({_id: asoc_doc}); // get the appointments associated with the Doctor


    if (cursor_count === 0) {
      return next(new ErrorHandler("There are no patient appointments with this doctor", 400));
    }

    // frontend should render or display in the below appointment data in a numbered list or table. 

    res.status(200).json({
      success: true,
      data: appointments,
    });
  
  });
  
  // Get single appointment by ID => /api/v1/appointment/:id  GET*****
  export const getAppointment = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const appointment = await Appointment.find({ _id: id , linkedto: req.user.id},)
      .populate("doctor")
      .populate("appointmentType")
      .populate("appointmentDate", "appointmentDuration")
      .populate("notes");
  
    if (!appointment) {
      return next(new ErrorHandler(`Specified appointment: ${id} does not exist for this user`, 404));
    }
  
    res.status(200).json({
      success: true,
      appointment,
    });
  });
  
  // Update appointment => /api/v1/appointment/update/:id PUT****
  export const updateAppointment = catchAsyncErrors(async (req, res, next) => {
    let allFree;
    const { id } = req.params;
    const { appointmentDate, appointmentDuration, appointmentType, notes } = req.body;

    const userRole = req.user.role;
    
    // if the user is a doctor or patient, check if active appointment exists and update 
    if (userRole === "doctor")
    {
      //const thisdoct = Doctor.findOne({_id: req.user.doctor_id});
      const query = { doctor: req.user.doctor_id, status: "active" };

      // fetch the specified doctor's appointment list
      app_list = await Appointment.find(query);
      if (!app_list) {
        allFree = true;
        return next(new ErrorHandler("You don't have any active appointments", 400));
      }
    }

    if (userRole === "user")
    {
      const appt = Appointment.findById(id);
      const thisDoctor = appt.doctor;
      const query = { doctor: thisDoctor, status: "active" };

      // fetch the specified doctor's appointment list
      app_list = await Appointment.find(query);

      if (!app_list) {
        allFree = true;
        return next(new ErrorHandler("You don't have any active appointments", 400));
      }
    }
    
    
    // Logic for checking available dates before updating appointment goes here:
    // check if the doctor is already booked for user selected period
    if (!allFree)
    {
      const available = app_list.find({ Appointment: { $elemMatch: { appointmentDate: appointmentDate, appointmentDuration: appointmentDuration} } });
      if (available) {
          console.log(`Doctor ${ doctor.name } is already booked for that date, kindly select another date`);
          return;
      }

      const update = {
          appointmentDate,
          appointmentDuration,
          appointmentType,
          notes,
      };
      
      // Update the Appointment when all conditions are met
      const appointment = await Appointment.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      })
        .populate("appointmentDate")
        .populate("appointmentDuration")
        .populate("appointmentType")
        .populate("notes");
    
      if (!appointment) {
        return next(new ErrorHandler("Specified appointment does not exist", 404));
      }
    
      res.status(200).json({
        success: true,
        data: post,
      });
    }
  });
  
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
      return next(new ErrorHandler("you cannot delete an active appointment, cancel it first", 302));
    }

    Appointment.findByIdAndDelete(id); // delete the specified appointment
  
    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  });

  // Cancel Appointment => /api/v1/appointment/:id PUT****
  export const cancelAppointment = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
  
    const update = {
      status: "cancelled",
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
  
    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
    });
  });