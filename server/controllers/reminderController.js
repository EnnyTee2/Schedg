const schedule = require('node-schedule');
const nodemailer = require('nodemailer');

import Appointment from "../models/appointmentModel.js";

const mail_transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'schedg23@gmail.com',
      pass: 'schedg2023'
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
            subject: `Reminder: ${appointment.appointmentType} Appointment with Doctor ${appointment.doctor.name}`,
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