import mongoose from "mongoose";

const { Schema, model } = mongoose;

const doctorSchema = new Schema({

    linkedto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: { 
        type: String,
    },
    phone: {
        type: String,
        minlength: [10, "Number must be at least 10 digits, do not include dialing code"],
        maxlength: 15,
        unique: true,
        required: true,
    },
    specialty: {
        type: String,
        default: "General Practice",
    },
    yearsExp: {
        type: Number,
        required: true,
    },
    availableHrs: {
        type: Array,
        default: [
            {
                "day_of_week": "Monday",
                "start_time": "09:00",
                "end_time": "03:00"
            },
            {
                "day_of_week": "Tuesday",
                "start_time": "09:00",
                "end_time": "03:00"
            },
            {
                "day_of_week": "Wednesday",
                "start_time": "09:00",
                "end_time": "03:00"
            },
            {
                "day_of_week": "Thursday",
                "start_time": "09:00",
                "end_time": "03:00"
            },
            {
                "day_of_week": "Friday",
                "start_time": "09:00",
                "end_time": "03:00"
            },
        ],
    
    },
    consultFee: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },

});

export default model("Doctor", doctorSchema);