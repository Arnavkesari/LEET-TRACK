import {Friend} from '../models/friend.model.js';
import {User} from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { leetCodeScraper } from './leetcodeScraper.controllers.js';

const getAllFriends = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const friends = await Friend.findByOwnerWithStats(userId);

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

  // Check if friend already exists for this user
  const existingFriend = await Friend.findOne({
    owner: userId,
    leetcodeId: leetcodeId.toLowerCase(),
  });

  if (existingFriend) {
    throw new ApiError(409, "Friend with this LeetCode ID already exists");
  }

  // Scrape LeetCode profile with retry logic
  console.log(`Attempting to scrape LeetCode profile for: ${leetcodeId}`);
  let profileData;
  try {
    profileData = await leetCodeScraper.withRetry(async () => {
      return await leetCodeScraper.scrapeLeetCodeProfile(leetcodeId);
    });
  } catch (error) {
    console.error('Scraping failed:', error);
    throw new ApiError(500, error.message || "Failed to fetch LeetCode profile");
  }
  
  if (!profileData) {
    throw new ApiError(404, "LeetCode profile not found. Please check the username.");
  }

  console.log('Profile data scraped successfully:', profileData);

  // Create friend record
  const friend = new Friend({
    name: profileData.name || leetcodeId,
    leetcodeId: leetcodeId.toLowerCase(),
    owner: userId,
    leetcodeData: profileData,
    scrapingStatus: 'success',
    lastScrapedAt: new Date()
  });

  await friend.save();

  // Add friend to user's friends array
  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { friends: friend._id } },
    { new: true }
  );

  return res.status(201).json(
    new ApiResponse(201, friend, "Friend added successfully.")
  );
});

const removeFriend = asyncHandler(async (req, res) => {
  const { friendId } = req.params;
  const userId = req.user._id;

  if (!friendId) {
    throw new ApiError(400, "Friend ID is required");
  }

  // Find friend and verify ownership
  const friend = await Friend.findOne({
    _id: friendId,
    owner: userId,
    isActive: true
  });

  if (!friend) {
    throw new ApiError(404, "Friend not found");
  }

  // Soft delete - mark as inactive
  friend.isActive = false;
  await friend.save();

  // Remove from user's friends array
  await User.findByIdAndUpdate(
    userId,
    { $pull: { friends: friendId } },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, { friendId }, "Friend removed successfully")
  );
});

const updateFriendData = asyncHandler(async (req, res) => {
  const { friendId } = req.params;
  const userId = req.user._id;

  if (!friendId) {
    throw new ApiError(400, "Friend ID is required");
  }

  // Find friend and verify ownership
  const friend = await Friend.findOne({
    _id: friendId,
    owner: userId,
    isActive: true
  });

  if (!friend) {
    throw new ApiError(404, "Friend not found");
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

    const updatedFriend = await Friend.findById(friendId).select('-scrapingErrors -lastScrapingError');

    return res.status(200).json(
      new ApiResponse(200, updatedFriend, "Friend data updated successfully")
    );
  } catch (error) {
    await friend.markScrapingFailed(error.message);
    throw new ApiError(500, `Failed to update friend data: ${error.message}`);
  }
});

const getFriendDetails = asyncHandler(async (req, res) => {
  const { friendId } = req.params;
  const userId = req.user._id;

  if (!friendId) {
    throw new ApiError(400, "Friend ID is required");
  }

  const friend = await Friend.findOne({
    _id: friendId,
    owner: userId,
    isActive: true
  }).select('-scrapingErrors -lastScrapingError');

  if (!friend) {
    throw new ApiError(404, "Friend not found");
  }

  return res.status(200).json(
    new ApiResponse(200, friend, "Friend details retrieved successfully")
  );
});

const getFriendsLeaderboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { sortBy = 'totalSolved', order = 'desc' } = req.query;

  const validSortFields = ['totalSolved', 'ranking', 'contestRating', 'streak'];
  const sortField = validSortFields.includes(sortBy) ? `leetcodeData.${sortBy}` : 'leetcodeData.totalSolved';
  const sortOrder = order === 'asc' ? 1 : -1;

  const friends = await Friend.find({
    owner: userId,
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
