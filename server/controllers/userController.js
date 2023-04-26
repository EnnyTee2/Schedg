import User from "../models/userModel.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import sendJwtToken from "../utils/sendJwtToken.js";
import cloudinary from 'cloudinary';

// Create a new user => /api/v1/register/ *****
export const createUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password , role} = req.body;

  const user = await User.findOne({ email: email });


  if (!user) {

    // const resultUserAvarter = await cloudinary.v2.uploader.upload(req.body.avarter, {
    //   folder: 'avarter',
    //   width: 150,
    //   crop: 'scale',
    // })

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      avarter: {
        public_id: "kjhgfgdffghj",
        url: "https://res.cloudinary.com/dutazckfk/image/upload/v1682339700/avarter/Dog_scvc9r.jpg" //resultUserAvarter.secure_url
      },
    });
    sendJwtToken(newUser, 200, res);
  } else {
    return next(new ErrorHandler("User already exists", 400));
  }
});

// Login existing user => /api/v1/login *****
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  // Check email and password is entered by user
  if (!email || !password) {
    return next(new ErrorHandler("Please fill in email and password", 400));
  }
  // Find user in database
  const user = await User.findOne({ email }).select("+password");

  //check user exists
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  
  const PasswordMatch = await user.isPasswordMatch(password);

  if (user && PasswordMatch) {
    sendJwtToken(user, 200, res);
  } else {
    res.status(401);
    return next(new ErrorHandler("Invalid email or password", 401));
  }
});

// Logout user => api/v1/logout ****
export const logoutUser = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });
  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

// Get currently logged in user details/profile => api/v1/me ****
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// Update password => api/v1/password/update ****
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Verify old password is correct
  const VerifyPassword = await user.isPasswordMatch(req.body.oldPassword);

  if (!VerifyPassword) {
    return next(new ErrorHandler("Your old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("New password and confirm Password does not match", 400)
    );
  }

  user.password = req.body.newPassword;
  await user.save();
  sendJwtToken(user, 200, res);
});

// Update user details/profile => api/v1/me/update ****
export const updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserDetails = {
    name: req.body.name,
    email: req.body.email,
    isDoctor: false,
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserDetails, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })
    .populate("appointments")
    .populate("name");

  res.status(200).json({
    success: true,
    user,
  });
});

// ADMIN ROUTES ********************************

// Get specific user => api/v1/admin/users/:id ****
export const getOneUser = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Get all users => api/v1/admin/users ****
export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

// Update user details/profile ADMIN => api/v1/admin/user/:id ****
export const updateUserProfileAdmin = catchAsyncErrors(
  async (req, res, next) => {
    const newUserDetails = {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserDetails, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    })
      .populate("comments")
      .populate("posts");

    res.status(200).json({
      success: true,
      user,
    });
  }
);

// Delete user details/profile ADMIN => api/v1/admin/user/:id ****
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler(`User with id ${req.params.id} not found`));
  }

  await user.remove();

  res.status(200).json({
    success: true,
  });
});
