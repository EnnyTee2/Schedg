import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const AppointmentSchema = new Schema({

    linkedto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Doctor",
    },
    appointmentDate: {
        type: Date,
        required: true,
    },
    appointmentDuration: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    appointmentType: {
        type: String,
        required: true,
        default: "Consultation",
    },
    notes: {
        type: String,
    },
});

export default model("Appointment", AppointmentSchema);