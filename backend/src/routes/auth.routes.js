import { Router } from "express";
import { 
    loginUser, 
    logoutUser, 
    refreshAccessToken,
    getCurrentUser,
    updateAccountDetails
} from "../controllers/user.controllers.js";
import {
    getGoogleAuthURL,
    googleAuthCallback,
    googleAuthWithToken
} from "../controllers/googleAuth.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Google OAuth routes
router.route("/google/url").get(getGoogleAuthURL);
router.route("/google/callback").get(googleAuthCallback);
router.route("/google/token").post(googleAuthWithToken);

// Protected routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-profile").patch(verifyJWT, updateAccountDetails);

export default router;
