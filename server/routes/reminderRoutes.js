import express from "express";

// import {
//     getAllReminders
// } from "../controllers/reminderController.js";

// Authenticator API, edit path to suite code
// import {isAuthenticatedUser} from "../middlewares/auth.js";

const router = express.Router();

router.get('/reminder/all', getAllReminders);
router.get('/reminder/switch-active', onReminders);
router.post('/reminder/deativate', offReminders);
router.delete('/reminder/:id', isAuthenticatedUser, deleteReminder);

export default router;