import { Router } from "express";
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  refreshAccessToken,
  getCurrentUser,
  setLeetCodeId,
  getUserProfile,
  refreshUserProfile,
  updateUserName,
  changeCurrentPassword
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Protected routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current").get(verifyJWT, getCurrentUser);
router.route("/set-leetcode-id").post(verifyJWT, setLeetCodeId);
router.route("/my-profile").get(verifyJWT, getUserProfile);
router.route("/refresh-profile").post(verifyJWT, refreshUserProfile);
router.route("/update-name").put(verifyJWT, updateUserName);
router.route("/change-password").put(verifyJWT, changeCurrentPassword);

export default router;