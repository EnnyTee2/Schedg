import express from "express";

import {
    getAppointment,
    getAllAppointments,
    getAllActiveAppointments,
    getAllCancelledAppointments,
    getAllPatientAppointments,
    createAppointmentPat,
    createAppointmentDoc,
    updateAppointment,
    deleteAppointment,
    cancelAppointment,
    updateAppStatus,
} from "../controllers/appointmentController.js";

// Authenticator API, edit path to suite code
import {
    isAuthenticatedUser, authorizeRoles
} from "../middlewares/auth.js";

const router = express.Router();

router.get('/appointment/all', isAuthenticatedUser, getAllAppointments);

router.get('/appointment/:id', isAuthenticatedUser, getAppointment);

router.post('/appointment/newconsult', isAuthenticatedUser, createAppointmentPat);
router.post('/appointment/newfollowup', isAuthenticatedUser, authorizeRoles("doctor"), createAppointmentDoc);

router.put('/appointment/update/:id', isAuthenticatedUser, updateAppointment);
router.delete('/appointment/:id', isAuthenticatedUser, deleteAppointment);

router.get('/appointment/all/refreshstatus', isAuthenticatedUser, updateAppStatus);
router.post('/appointment/cancel/:id', isAuthenticatedUser, cancelAppointment);
router.get('/appointment/all/active', isAuthenticatedUser, getAllActiveAppointments);
router.get('/appointment/all/cancelled', isAuthenticatedUser, getAllCancelledAppointments);
router.get('/appointment/patients/all', isAuthenticatedUser, authorizeRoles("doctor"), getAllPatientAppointments);

export default router;