import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";
//import Appointment from "../models/appointmentModel.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/ErrorHandler.js";
//import sendJwtToken from "../utils/sendJwtToken.js";
//import cloudinary from 'cloudinary';


// Existing user applying as doctor => /api/v1/register-as-doctor *****
export const applyDoctor = catchAsyncErrors(async (req, res, next) => {
    const { phone, specialty, yearsExp, consultFee, availableHrs } = req.body;
  

    // Check if any doctor is linked to the user account
    const isDoctor = await Doctor.findOne( { linkedto: req.user.id} );
    

    if (!isDoctor) {
        const user = await User.findById(req.user.id);
        //const username = await User.findOne({ _id: req.user.id })
        const newdoc = await Doctor.create(
            {
                linkedto: user,
                name: user.name,
                phone,
                specialty,
                consultFee,
                yearsExp,
                availableHrs,
            }
        );
        if (!newdoc) {
            return next(new ErrorHandler("Doctor Profile was not succesfully registered", 400));
        }
        
        // Elevate user role to doctor
        console.log(`newdoc id is: ${newdoc._id}`);

        const userUpdate = {
            role: "doctor",
            doctorId: newdoc._id,
            isDoctor: true,
        };
        const user_update = await User.findByIdAndUpdate(req.user.id, userUpdate, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        })
            .populate("role")
            .populate("doctorId")
            .populate("isDoctor");

        res.status(201).json({
            success: true,
            message: "Doctor profile successfully registered",
            data: newdoc, user_update,
        });
    
    } else {
        return next(new ErrorHandler("Error! Doctor Profile already exists on this account", 400))
    }

});

// Get single doctor profile => /api/v1/doctor/:id  *****
export const getDoctor = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    const doctor = await Doctor.findOne({linkedto: req.user.id}, {linkedto: 0, phone: 0, createdAt: 0, updatedAt: 0});
  
    if (!doctor) {
      return next(new ErrorHandler("Doctor profile could not be found", 404));
    }
  
    // optionally populate user appointments associated with the doctor being viewed
    //const appointment = await Appointment.find({ linkedto: doctor, status: "active" }).populate("");
  
    res.status(200).json({
      success: true,
      data: doctor,
    });
});

export const getDoctorProfile = catchAsyncErrors(async (req, res, next) => {
    const doctor = await Doctor.findOne({linkedto: req.user.id})

    if (!doctor) {
        return next(new ErrorHandler("No Doctor Profile attached to this account", 404));
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  });

// Get all doctors for user view => api/v1/doctor/all ***
export const getListDoctors = catchAsyncErrors(async (req, res, next) => {

    const doctors = await Doctor.find({}, {linkedto: 0, phone: 0, createdAt: 0, updatedAt: 0});

    if (!doctors) {
        return next(new ErrorHandler("There are no Doctors Available", 404));
    }

    res.status(200).json({
      success: true,
      doctors,
    });
});

// Get all doctors for admin view => api/v1/doctor/alldoctorinfo ***
export const getFullDoctors = catchAsyncErrors(async (req, res, next) => {
    const doctors = await Doctor.find();

    res.status(200).json({
      success: true,
      doctors,
    });
});


// Update doctor profile => api/v1/doctor/:id ****
export const updateDoctor = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;

    const { phone, specialty, yearsExp, consultFee, availableHrs } = req.body;
    const update = {
        phone,
        specialty,
        yearsExp,
        consultFee,
        availableHrs,
    };

    const doctor = await Doctor.findByIdAndUpdate(id, update, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })
        .populate("phone")
        .populate("specialty")
        .populate("yearsExp")
        .populate("consultFee")
        .populate("availableHrs");

    if (!doctor) {
        return next(new ErrorHandler("Doctor Profile could not be updated", 404));
    }

    res.status(200).json({
        success: true,
        data: doctor,
    });
});

// Delete doctor profile => api/v1/doctor/me/delete ****
export const deleteDoctorProfile = catchAsyncErrors(async (req, res, next) => {
    const user = User.find({ _id: req.user.id });

    const doctor = await Doctor.findByIdAndDelete(req.user.doctorId);
    const update = {
        role: "user",
        doctorId: null,
        isDoctor: false,
    };
    const ape = User.findByIdAndUpdate(req.user.id, update, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })
    .populate("role")
    .populate("doctorId")
    .populate("isDoctor");

    console.log(`Doctors ID before delete is: ${req.user.doctorId} logg id: ${user}`);

    
    if (!doctor)
    {
        //const doctor = await Doctor.findByIdAndDelete(id);
        return next(new ErrorHandler("You don't have a Doctor's account", 400));
    }

    // revert user profile to default

    res.status(200).json({
        success: true,
        message: "Doctor Profile deleted succesfully",
    });
});

export const deleteDoctor = catchAsyncErrors(async (req, res, next) => {
    const user = User.findOne({ doctorId: req.params.id }); // find the user with the specified doctorId

    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    const update = {
        role: "user",
        doctorId: null,
        isDoctor: false
    }
    const delDocUser = User.findByIdAndUpdate(user._id, update, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    })
        .populate("role")
        .populate("doctorId")
        .populate("isDoctor");

    if (!doctor) {
        //const doctor = await Doctor.findByIdAndDelete(id);
        return next(new ErrorHandler("The specified Doctor account does not exist", 400));
    }

    // revert user profile to default

    res.status(200).json({
        success: true,
        message: "Doctor Profile deleted succesfully",
        data: delDocUser,
    });
});


// Delete all doctor profiles => api/v1/doctor/delete_all ****
export const deleteAllDoctor = catchAsyncErrors(async (req, res, next) => {

    const doctor = await Doctor.deleteMany({}); // delete all documents in the Doctor collection

    if (!doctor) {
        return next(new ErrorHandler("Something went wrong, could not delete the profiles", 400));
    }

    res.status(200).json({
        success: true,
        message: "All Doctor Profiles deleted succesfully",
    });
});