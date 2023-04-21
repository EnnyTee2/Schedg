import express from "express";

import {
    getAllReminders,
    deleteReminder,
} from "../controllers/reminderController.js";

// Authenticator API, edit path to suite code
import {isAuthenticatedUser} from "../middlewares/auth.js";

const router = express.Router();

router.get('/reminder/all', isAuthenticatedUser, getAllReminders);
router.delete('/reminder/:id', isAuthenticatedUser, deleteReminder);

export default router;