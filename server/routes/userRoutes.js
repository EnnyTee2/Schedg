import express from "express";
import {
   createUser,
   getAllUsers,
   getOneUser,
   getUserProfile,
   loginUser,
   logoutUser,
//   updatePassword,
   updateUserProfile,
   updateUserProfileAdmin,
   deleteUser,
} from "../controllers/userController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);

router.get("/me", isAuthenticatedUser, getUserProfile);
router.put("/me/update", isAuthenticatedUser, updateUserProfile);
//router.put("/password/update", isAuthenticatedUser, updatePassword);
 
router.get("/admin/users", isAuthenticatedUser, authorizeRoles('admin'), getAllUsers)
router.get("/admin/user/:id", isAuthenticatedUser, authorizeRoles('admin'), getOneUser)
router.put("/admin/user/:id", isAuthenticatedUser, authorizeRoles('admin'), updateUserProfileAdmin)
router.delete("/admin/user/:id", isAuthenticatedUser, authorizeRoles('admin'), deleteUser)

export default router;