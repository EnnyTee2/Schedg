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
        required: true,
    },
    appointmentDuration: {
        type: Number,
        required: true,
    },
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
    }
});

export default model("Appointment", AppointmentSchema);