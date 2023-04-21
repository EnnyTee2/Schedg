import mongoose from "mongoose";
import dotenv from "dotenv";

mongoose.set('strictQuery', false);


 
export const dbConnect = (URI) => {
  try {
    mongoose.connect(URI);
    console.log("connection to database is sucessful!");
  } catch (err) {
    console.log("Data base connection failed");
  }
  return {}
};