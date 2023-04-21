import mongoose from "mongoose";
import Appointment from "./appointmentModel.js";

const { Schema, model } = mongoose;

const ReminderSchema = new Schema({

    linkedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
    },
    reminderMessage: {
        type: String,
        required: true,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        default: "System",
    },
    reminderDate: {
        type: Date,
        required: true,
    },
    createdDate: {
    type: Date,
    default: Date.now,
    },
});

export default model('Reminder', ReminderSchema);