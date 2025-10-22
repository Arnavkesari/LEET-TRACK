import { Router } from "express";
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  refreshAccessToken,
  getCurrentUser,
  setLeetCodeId
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

export default router;