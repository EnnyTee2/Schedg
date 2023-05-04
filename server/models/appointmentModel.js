import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const AppointmentSchema = new Schema({

    linkedto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
    },
    appointmentDate: {
        type: Date,
    },
    appointmentTime: [
        {
            start: {type: Date, required: true},
            end: {type: Date, required: true}
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    appointmentType: {
        type: String,
        default: "Consultation",
    },
    notes: {
        type: String,
    },
    status: {
        type: String,
        default: "active",
    },
    umail: {
        type: String,
        default: "",
    },
    dmail: {
        type: String,
        default: "",
    },
    reminder: {
        type: Boolean,
        default: true,
    },
});

// Validate the appointment start and end date
// ensure start date is not in the past
// AppointmentSchema.path('appointmentTime.start').validate({
//     validator: function(value) {
//         const currDate = new Date.now;
//         return value > currDate;
//     },
//     message: 'Selected appointment start date cannot be a past date'
//     });  

// // ensure end date is greater than start
// AppointmentSchema.path('appointmentTime.end').validate({
//     validator: function(value) {
//       return value > this.appointmentTime
//       .start;
//     },
//     message: 'Selected appointment end date must be greater than start date'
//   });

  export default model("Appointment", AppointmentSchema);