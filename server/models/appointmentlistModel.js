import mongoose from "mongoose";
import Appointment from "./appointmentModel.js"

const {Schema, model} = mongoose;

const AppointmentListSchema = new Schema({
    linkedto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
    },
    appointments: {
        type: [Appointment],
        default: [],
    }

});

export default model('AppointmentList', AppointmentListSchema);