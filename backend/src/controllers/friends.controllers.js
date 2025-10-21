import {Friend} from '../models/friend.model.js';
import {User} from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { leetCodeScraper } from './leetcodeScraper.controllers.js';

const getAllFriends = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get user with friends array
  const user = await User.findById(userId).select('friends');
  
  if (!user || !user.friends || user.friends.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, [], "No friends found")
    );
  }

  // Get all friends by their leetcode IDs
  const friends = await Friend.findByLeetcodeIds(user.friends);

  return res.status(200).json(
    new ApiResponse(200, friends, "Friends retrieved successfully")
  );
});

const addFriend = asyncHandler(async (req, res) => {
  const { leetcodeId } = req.body;
  const userId = req.user._id;

  if (!leetcodeId) {
    throw new ApiError(400, "LeetCode ID is required");
  }

  const normalizedLeetcodeId = leetcodeId.toLowerCase().trim();

  // Get current user
  const user = await User.findById(userId);
  
  // Check if friend already exists in user's friends array
  if (user.friends && user.friends.includes(normalizedLeetcodeId)) {
    throw new ApiError(409, "Friend with this LeetCode ID already exists in your list");
  }

  // Scrape LeetCode profile with retry logic
  console.log(`Attempting to scrape LeetCode profile for: ${normalizedLeetcodeId}`);
  let profileData;
  try {
    profileData = await leetCodeScraper.withRetry(async () => {
      return await leetCodeScraper.scrapeLeetCodeProfile(normalizedLeetcodeId);
    });
  } catch (error) {
    console.error('Scraping failed:', error);
    throw new ApiError(500, error.message || "Failed to fetch LeetCode profile");
  }
  
  if (!profileData) {
    throw new ApiError(404, "LeetCode profile not found. Please check the username.");
  }

  console.log('Profile data scraped successfully:', profileData);

  // Check if friend exists in friends collection
  let friend = await Friend.findOne({ leetcodeId: normalizedLeetcodeId });

  if (friend) {
    // Friend exists - update the data
    console.log(`Friend ${normalizedLeetcodeId} exists, updating data...`);
    friend.name = profileData.name || normalizedLeetcodeId;
    friend.leetcodeData = profileData;
    friend.scrapingStatus = 'success';
    friend.lastScrapedAt = new Date();
    friend.isActive = true;
    await friend.save();
  } else {
    // Friend doesn't exist - create new entry
    console.log(`Creating new friend entry for ${normalizedLeetcodeId}...`);
    friend = new Friend({
      name: profileData.name || normalizedLeetcodeId,
      leetcodeId: normalizedLeetcodeId,
      leetcodeData: profileData,
      scrapingStatus: 'success',
      lastScrapedAt: new Date()
    });
    await friend.save();
  }

  // Add friend's leetcode ID to user's friends array
  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { friends: normalizedLeetcodeId } },
    { new: true }
  );

  return res.status(201).json(
    new ApiResponse(201, friend, "Friend added successfully.")
  );
});

const removeFriend = asyncHandler(async (req, res) => {
  const { leetcodeId } = req.params;
  const userId = req.user._id;

  if (!leetcodeId) {
    throw new ApiError(400, "LeetCode ID is required");
  }

  const normalizedLeetcodeId = leetcodeId.toLowerCase().trim();

  // Get current user
  const user = await User.findById(userId);
  
  // Check if friend exists in user's friends array
  if (!user.friends || !user.friends.includes(normalizedLeetcodeId)) {
    throw new ApiError(404, "Friend not found in your list");
  }

  // Remove from user's friends array
  await User.findByIdAndUpdate(
    userId,
    { $pull: { friends: normalizedLeetcodeId } },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, { leetcodeId: normalizedLeetcodeId }, "Friend removed successfully")
  );
});

const updateFriendData = asyncHandler(async (req, res) => {
  const { leetcodeId } = req.params;
  const userId = req.user._id;

  if (!leetcodeId) {
    throw new ApiError(400, "LeetCode ID is required");
  }

  const normalizedLeetcodeId = leetcodeId.toLowerCase().trim();

  // Get current user
  const user = await User.findById(userId);
  
  // Check if friend exists in user's friends array
  if (!user.friends || !user.friends.includes(normalizedLeetcodeId)) {
    throw new ApiError(404, "Friend not found in your list");
  }

  // Find friend in friends collection
  const friend = await Friend.findOne({ leetcodeId: normalizedLeetcodeId, isActive: true });

  if (!friend) {
    throw new ApiError(404, "Friend data not found");
  }

  // Check if scraping is already in progress
  if (friend.scrapingStatus === 'scraping') {
    throw new ApiError(409, "Profile data is already being updated");
  }

  // Start scraping
  try {
    await friend.markScrapingStarted();
    
    const scrapedData = await leetCodeScraper.withRetry(async () => {
      return await leetCodeScraper.scrapeLeetCodeProfile(friend.leetcodeId);
    });
    
    if (!scrapedData) {
      await friend.markScrapingFailed('Profile not found');
      throw new ApiError(404, "LeetCode profile not found");
    }
    
    await friend.updateLeetCodeData(scrapedData);

    const updatedFriend = await Friend.findOne({ leetcodeId: normalizedLeetcodeId }).select('-scrapingErrors -lastScrapingError');

    return res.status(200).json(
      new ApiResponse(200, updatedFriend, "Friend data updated successfully")
    );
  } catch (error) {
    await friend.markScrapingFailed(error.message);
    throw new ApiError(500, `Failed to update friend data: ${error.message}`);
  }
});

const getFriendDetails = asyncHandler(async (req, res) => {
  const { leetcodeId } = req.params;
  const userId = req.user._id;

  if (!leetcodeId) {
    throw new ApiError(400, "LeetCode ID is required");
  }

  const normalizedLeetcodeId = leetcodeId.toLowerCase().trim();

  // Get current user
  const user = await User.findById(userId);
  
  // Check if friend exists in user's friends array
  if (!user.friends || !user.friends.includes(normalizedLeetcodeId)) {
    throw new ApiError(404, "Friend not found in your list");
  }

  const friend = await Friend.findOne({
    leetcodeId: normalizedLeetcodeId,
    isActive: true
  }).select('-scrapingErrors -lastScrapingError');

  if (!friend) {
    throw new ApiError(404, "Friend data not found");
  }

  return res.status(200).json(
    new ApiResponse(200, friend, "Friend details retrieved successfully")
  );
});

const getFriendsLeaderboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { sortBy = 'totalSolved', order = 'desc' } = req.query;

  // Get user with friends array
  const user = await User.findById(userId).select('friends');
  
  if (!user || !user.friends || user.friends.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, [], "No friends found")
    );
  }

  const validSortFields = ['totalSolved', 'ranking', 'contestRating', 'streak'];
  const sortField = validSortFields.includes(sortBy) ? `leetcodeData.${sortBy}` : 'leetcodeData.totalSolved';
  const sortOrder = order === 'asc' ? 1 : -1;

  const friends = await Friend.find({
    leetcodeId: { $in: user.friends },
    isActive: true,
    scrapingStatus: 'success'
  })
  .select('-scrapingErrors -lastScrapingError')
  .sort({ [sortField]: sortOrder });

  // Add ranking position
  const leaderboard = friends.map((friend, index) => ({
    ...friend.toObject(),
    position: index + 1
  }));

  return res.status(200).json(
    new ApiResponse(200, leaderboard, "Friends leaderboard retrieved successfully")
  );
});

// Background function to scrape friend profile
const scrapeFriendProfile = async (friendId) => {
  try {
    const friend = await Friend.findById(friendId);
    if (!friend) return;

    await friend.markScrapingStarted();
    
    const scrapedData = await leetCodeScraper.scrapeLeetCodeProfile(friend.leetcodeId);
    await friend.updateLeetCodeData(scrapedData);
    
    console.log(`Successfully scraped profile for ${friend.leetcodeId}`);
  } catch (error) {
    console.error(`Failed to scrape profile for friend ${friendId}:`, error);
    
    const friend = await Friend.findById(friendId);
    if (friend) {
      await friend.markScrapingFailed(error.message);
    }
  }
};

// Bulk update friends data (for scheduled jobs)
const bulkUpdateFriendsData = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const friendsNeedingUpdate = await Friend.findNeedingScraping(parseInt(limit));
  
  const updatePromises = friendsNeedingUpdate.map(friend => 
    scrapeFriendProfile(friend._id)
  );

  await Promise.allSettled(updatePromises);

  return res.status(200).json(
    new ApiResponse(200, { 
      updated: friendsNeedingUpdate.length 
    }, "Bulk update initiated")
  );
});

export {
  getAllFriends,
  addFriend,
  removeFriend,
  updateFriendData,
  getFriendDetails,
  getFriendsLeaderboard,
  bulkUpdateFriendsData
};
