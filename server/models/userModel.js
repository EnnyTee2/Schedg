import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: true,
    minlength: [6, "Password must be at least 6 characters"],
    select: false,
  },
  avarter: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  role: {
    type: String,
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isDoctor: {
    type: Boolean,
    default: false,
  },
  doctorId: {
    type: String //mongoose.Schema.Types.ObjectId,
  }
});

// Save hashed password to database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Define password match schema method
userSchema.methods.isPasswordMatch = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Schema method to get jwt token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_SECRET_EXPIRES,
  });
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  // Generate the password reset token
  const resetPasswordToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetPasswordToken)
    .digest("hex");

  // Set reset password token expiration time
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  return resetPasswordToken;
};

export default model("User", userSchema);
