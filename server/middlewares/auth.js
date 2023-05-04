import Jwt from "jsonwebtoken";
import ErrorHandler from "../utils/ErrorHandler.js";
import catchAsyncErrors from "./catchAsyncErrors.js";
import User from "../models/userModel.js";
import Appointment from "../models/appointmentModel.js";

// Check if user is authenticated
export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(
      new ErrorHandler("Please log in to access this resource.", 401)
    );
  }
  const decoded = Jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  next();
});

// Handle user roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `${req.user.role} is not authorized to access this resource`,
          403
        )
      );
    }
    next();
  };
};

// // Refresh Appointment Status
// export const updater = (id, update) => {
//   return (req, res, next) => {
//     await Appointment.findByIdAndUpdate(id, update, {
//       new: true,
//       runValidators: true,
//       useFindAndModify: false,
//     })
//     next();
//   };
// };



// // Update Appointment Status => /api/v1/appointment/:id PUT****
// export const updateAppStatus = catchAsyncErrors(async (req, res, next) => {
//   const update = {status: "expired"};

//   const currentDate = Date.now();
//   const appointmentList = await Appointment.find({status: "active"})
  
//   const lister = appointmentList.forEach((app) => {

//     if (app.appointmentTime[0].end <= currentDate){
//       updater(app._id, {status: 'expired'});
//     }
//   });

//   res.status(200).json({
//     success: true,
//     message: "Appointments refreshed successfully",
//   });
// });

// // // async function to update all the appointment db records
// const updater = async (id, update) => {
//   await Appointment.findByIdAndUpdate(id, update, {
//     new: true,
//     runValidators: true,
//     useFindAndModify: false,
//   })
// }

// // Refresh Appointment Status
// export const updateStatus = async () => {
//   const currentDate = Date.now();
//   const appointmentList = await Appointment.find({status: "active"})
  
//   const lister = appointmentList.forEach((app) => {
//     if (app.appointmentTime[0].end <= currentDate){
//       updater(app._id, {status: 'expired'});
//     }
//   });
//   return (req, res, next) => {
//     res.status(200).json({
//           success: true,
//           message: "Appointments refreshed successfully",
//         });
//     next();
//   };
// };