import nodemailer from "nodemailer";
import schedule from "node-schedule";


import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";
import Appointment from "../models/appointmentModel.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";


// nodemailer  transporter config
export const mail_transporter = nodemailer.createTransport(
  {
    service: 'gmail',
    auth: {
      user: 'schedg23@gmail.com',
      pass: 'SChedG?2023'
    }
  });

  // Schedule the function to run every hour
const reminderJob = schedule.scheduleJob('0 * * * *', async function() {
    // Find all appointments scheduled within the next 24 hours
    const now = new Date();
    const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const appointments = await Appointment.find({ appointmentDate: { $gte: now, $lt: end } });

    // Send reminder emails to user
  for (const appointment of appointments) {
    const timeRemaining = appointment.appointmentDate - now;
    if (timeRemaining <= 60 * 60 * 1000) { // send a reminder if the appointment is within the next hour
        const mailOptions = {
            from: 'schedg23@gmail.com',
            to: appointment.linkedto.email,
            subject: `Reminder: Your ${appointment.appointmentType} Appointment with Doctor ${appointment.doctor.name}`,
            text: `Hello ${appointment.linkedto.name},\n\nThis is a reminder that you have an appointment with Doctor ${appointment.doctor.name} at ${appointment.appointmentDate}.\n\nThank you,\nSchedG Telehealth.`
        };
      mail_transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Reminder email sent: ' + info.response);
        }
      });
    }
  }
});

// Inform user of cancelled appointment by doctor
// const mailOptions = {
//   from: 'schedg23@gmail.com',
//   to: cancelledApp.linkedto.email,
//   subject: `Reminder: ${cancelledApp.appointmentType} Appointment with Doctor ${ cancelledApp.doctor.name}`,
//   text: `Hello ${cancelledApp.linkedto.name},\n\nThis is a reminder that your appointment with Doctor ${cancelledApp.doctor.name} at ${cancelledApp.appointmentDate} has been cancelled.\n\nThank you,\nSchedG Telehealth.`
// };

// mail_transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//   console.log(error);
//   } else {
//   console.log('Reminder email sent: ' + info.response);
// }
// });

// Function to inform doctors/patients of cancelled appointments => /api/v1/register-as-doctor *****
export const remPatCancel = catchAsyncErrors(async (req, res, next) => {
    const { phone, specialty, yearsExp, consultFee, availableHrs } = req.body;
  

    // Check if any doctor is linked to the user account
    const isDoctor = await Doctor.findOne( { linkedto: req.user.id} );
});