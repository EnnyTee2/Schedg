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
      pass: 'tivmxfblhlnmbmwk'
    }
  });


// Turn reminder On or Off for a given appointment
export const reminderSwitch = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  //const { reminder } = req.body;

  reminde
  const appointment = await Appointment.findByIdAndUpdate(id, { reminder: reminder });

  if (!appointment) {
    return next(new ErrorHandler("Error while switching reminder", 500));
  }
});
// pass: 'SChedG?2023'



  // Schedule the function to run every hour
const reminderJob = schedule.scheduleJob('0 * * * *', async function() {
    // Find all appointments scheduled within the next 24 hours
    const now = new Date();
    const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const appointments = await Appointment.find({ appointmentDate: { $gte: now, $lt: end }, status: "active" });

    // Send reminder emails to user
  for (const appointment of appointments) {
    if (appointment.reminder === true)
    {
      const timeRemaining = appointment.appointmentDate - now;
      if (timeRemaining <= 60 * 60 * 1000) { // send a reminder if the appointment is within the next hour
          const mailOptions = {
              from: 'schedg23@gmail.com',
              to: appointment.umail,
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
  }
});
