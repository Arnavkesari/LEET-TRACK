import { Router } from "express";
import {
  getAllFriends,
  addFriend,
  removeFriend,
  updateFriendData,
  getFriendDetails,
  getFriendsLeaderboard,
  bulkUpdateFriendsData
} from "../controllers/friends.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// All friends routes require authentication
router.use(verifyJWT);

// Additional features (must be before parameterized routes)
router.route("/leaderboard").get(getFriendsLeaderboard);
router.route("/bulk-update").post(bulkUpdateFriendsData);

// Friends CRUD operations
router.route("/").get(getAllFriends).post(addFriend);
router.route("/:friendId").get(getFriendDetails).delete(removeFriend);
router.route("/:friendId/update").patch(updateFriendData);

export default router;
