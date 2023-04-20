import mongoose from "mongoose";


const {Schema, model} = mongoose;

const doctorSchema = new Schema({

    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    specialty: {
        type: String,
        default: "General Practice"
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

export default model('Doctor', doctorSchema);