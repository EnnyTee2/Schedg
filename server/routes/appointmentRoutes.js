import express from "express";

import {
    getAllAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
} from "../controllers/appointmentController.js";

// Authenticator API, edit path to suite code
import {isAuthenticatedUser} from "../middlewares/auth.js";

const router = express.Router();

router.get('/appointment/all', isAuthenticatedUser, getAllAppointments);

router.get('/appointment/:id', isAuthenticatedUser, getAppointment);

router.post('/appointment/new', isAuthenticatedUser, createAppointment);
router.put('/appointment/:id', isAuthenticatedUser, updateAppointment);
router.delete('/appointment/:id', isAuthenticatedUser, deleteAppointment);

export default router;