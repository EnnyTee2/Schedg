import express from "express";

import dotenv from "dotenv";
import { dbConnect } from "./config/dbConnect.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";


// Set up env configuration
dotenv.config({
  path: "backend/config/config.env",
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


app.use("/api/v1/", appointmentRoutes);
app.use("/api/v1/", reminderRoutes);


app.listen(PORT, () => {
  console.log(
    `App listening on port ${process.env.PORT} in ${ENV} mode.`
  );
});
