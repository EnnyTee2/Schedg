import express from "express";

import {
    applyDoctor,
    getDoctor,
    getDoctorProfile,
    getListDoctors,
    getFullDoctors,
    updateDoctorProfile,
    updateDoctor,
    deleteDoctor,
    deleteAllDoctor,
    deleteDoctorProfile,
} from "../controllers/doctorController.js";

// Authenticator and Authorization API
import {
    isAuthenticatedUser, authorizeRoles
} from "../middlewares/auth.js";

const router = express.Router();


router.get("/me", isAuthenticatedUser, getDoctorProfile);
router.get('/all', isAuthenticatedUser, getListDoctors);
router.get('/alldoctorinfo', isAuthenticatedUser, authorizeRoles("admin"), getFullDoctors);

router.post('/register-as-doctor', isAuthenticatedUser, applyDoctor);

router.get('/:id', isAuthenticatedUser, getDoctor);
router.put('/me/update', isAuthenticatedUser, updateDoctorProfile);
router.delete('/me/delete', isAuthenticatedUser, deleteDoctorProfile);

router.put('/update/:id', isAuthenticatedUser, authorizeRoles("admin"), updateDoctor);
router.delete('/delete/:id', isAuthenticatedUser, authorizeRoles("admin"), deleteDoctor);
router.delete('/delete_all', isAuthenticatedUser, authorizeRoles("admin"), deleteAllDoctor);

export default router;