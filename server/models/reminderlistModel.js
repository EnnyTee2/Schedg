import mongoose from "mongoose";
import Reminder from "./reminderModel.js"

const { Schema, model } = mongoose;

const ReminderListSchema = new Schema({
    linkedto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    reminders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reminder",
        }
    ]


});

export default model('ReminderList', ReminderListSchema);