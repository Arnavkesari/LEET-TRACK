import { Router } from "express";
import {
  scrapeLeetCodeProfile,
  validateLeetCodeProfile
} from "../controllers/leetcodeScraper.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// All scraper routes require authentication
router.use(verifyJWT);

// LeetCode scraping endpoints
router.route("/profile/:leetcodeId").get(scrapeLeetCodeProfile);
router.route("/validate/:leetcodeId").get(validateLeetCodeProfile);

export default router;
