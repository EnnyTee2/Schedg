import express from "express";

import dotenv from "dotenv";
import { dbConnect } from "./config/dbConnect.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
//import reminderRoutes from "./routes/reminderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import cors from 'cors';
import errorMiddleWare from "./middlewares/error.js";
import cloudinary from 'cloudinary'
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";

// Set up env configuration
dotenv.config({
  path: "server/config/config.env",
});

// Database Connect
dbConnect(process.env.MONGO_DATABASE);

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err.stack}`);
  console.log("shutting down due to uncaughtException");
  process.exit(1);
});

// Handle promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("shutting down server due to unhandledRejection");
  server.close(() => {
    process.exit(1);
  });
});

const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || "DEVELOPMENT";

const app = express();

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
const corsOptions = {
  origin: allowedOrigins,
  optionsSuccessStatus: 200, 
  credentials: true,
};

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors(corsOptions));
app.use(fileUpload());

// Setting up cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

app.use("/api/v1/", appointmentRoutes);
app.use("/api/v1/doctor/", doctorRoutes);
app.use("/api/v1/", userRoutes);

// app.use("/api/v1/", reminderRoutes);

// Error handling middleware
app.use(errorMiddleWare);

app.listen(PORT, () => {
  console.log(
    `App listening on port ${process.env.PORT} in ${ENV} mode.`
  );
});
