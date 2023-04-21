import Appointment from "../models/appointmentModel.js";
import AppointmentList from "../models/appointmentlistModel.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";

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

    // logic for checking availability of selected date goes here
  
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
      message: "Appointment successfully created",
      data: appointment,
    });
  });
  
  // All appointments => /api/v1/appointments GET*****
  export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {

    const appointments = await Appointment.find()
        .populate("Doctor")
        .populate("appointmentType")
        .populate("appointmentDate", "appointmentDuration")
        .populate("notes");
  
    res.status(200).json({
      success: true,
      data: posts,
    });
  });
  
  // Get single appointment => /api/v1/appointment/:id  GET*****
  export const getAppointment = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
  
    const appointment = await Appointment.findById(id)
      .populate("Doctor")
      .populate("appointmentType")
      .populate("appointmentDate", "appointmentDuration")
      .populate("notes");
  
    if (!appointment) {
      return next(new ErrorHandler("Specified appointment does not exist", 404));
    }
  
    res.status(200).json({
      success: true,
      data: post,
      comments,
    });
  });
  
  // Update appointment => /api/v1/appointment/:id PUT****
  export const updateAppointment = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    
    
    const { doctor, appointmentDate, appointmentDuration, appointmentType, notes } = req.body;

    // Logic for checking available dates before updating appointment goes here:
    const query = { linkedto: doctor };

    // fetch the specified doctor's appointment list
    app_list = await AppointmentList.find(query);

    if (!app_list) {
        return next(new ErrorHandler("Specified Doctor does not exist", 404));
    }

    // check if the doctor is already booked for user selected period 
    const available = app_list.find({ Appointment: { $elemMatch: { appointmentDate: appointmentDate, appointmentDuration: appointmentDuration} } },
        function (err, appointment) { 
            if (err) { 
                console.error(err);
            return false;
            }
        });
    
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
  });
  
  // Delete post => /api/v1/appointment/:id PUT****
  export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
  
    const appointment = await Appointment.findByIdAndDelete(id);
  
    if (!appointment) {
      return next(new ErrorHandler("Specified appointment does not exist", 404));
    }
  
    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
    });
  });