import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { Friend } from '../models/friend.model.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

// Get leaderboard data
router.get('/leaderboard', verifyJWT, asyncHandler(async (req, res) => {
  const { sortBy = 'totalSolved', timeFilter = 'allTime', limit = 50 } = req.query;
  
  try {
    // Get user's friends for leaderboard
    const user = await User.findById(req.user._id).populate('friends');
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    let friends = user.friends;

    // Apply time filters if needed
    if (timeFilter !== 'allTime') {
      const now = new Date();
      let filterDate;
      
      switch (timeFilter) {
        case 'thisWeek':
          filterDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'thisMonth':
          filterDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'today':
          filterDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        default:
          filterDate = null;
      }
      
      if (filterDate) {
        friends = friends.filter(friend => 
          friend.leetcodeData.lastUpdated >= filterDate
        );
      }
    }

    // Sort friends based on criteria
    friends.sort((a, b) => {
      const aData = a.leetcodeData;
      const bData = b.leetcodeData;
      
      switch (sortBy) {
        case 'totalSolved':
          return (bData.totalSolved || 0) - (aData.totalSolved || 0);
        case 'contestRating':
          return (bData.contestRating || 0) - (aData.contestRating || 0);
        case 'streak':
          return (bData.currentStreak || 0) - (aData.currentStreak || 0);
        case 'ranking':
          return (aData.globalRanking || Infinity) - (bData.globalRanking || Infinity);
        case 'weeklyProgress':
          return (bData.weeklyProgress || 0) - (aData.weeklyProgress || 0);
        default:
          return (bData.totalSolved || 0) - (aData.totalSolved || 0);
      }
    });

    // Add ranking positions
    const rankedFriends = friends.slice(0, limit).map((friend, index) => ({
      ...friend.toObject(),
      currentRank: index + 1
    }));

    // Calculate summary statistics
    const stats = {
      totalFriends: friends.length,
      totalProblems: friends.reduce((sum, f) => sum + (f.leetcodeData.totalSolved || 0), 0),
      averageRating: friends.length > 0 
        ? Math.round(friends.reduce((sum, f) => sum + (f.leetcodeData.contestRating || 0), 0) / friends.length)
        : 0,
      weeklyProgress: friends.reduce((sum, f) => sum + (f.leetcodeData.weeklyProgress || 0), 0)
    };

    return res
      .status(200)
      .json(new ApiResponse(200, {
        leaderboard: rankedFriends,
        stats,
        filters: { sortBy, timeFilter, limit }
      }, 'Leaderboard fetched successfully'));

  } catch (error) {
    throw new ApiError(500, 'Error fetching leaderboard data');
  }
}));

// Get friend profile data
router.get('/profile/:username', verifyJWT, asyncHandler(async (req, res) => {
  const { username } = req.params;
  
  try {
    // Find friend by LeetCode username
    const friend = await Friend.findOne({ leetcodeUsername: username });
    
    if (!friend) {
      throw new ApiError(404, 'Friend profile not found');
    }

    // Check if this friend belongs to the current user
    const user = await User.findById(req.user._id);
    if (!user.friends.includes(friend._id)) {
      throw new ApiError(403, 'Access denied to this profile');
    }

    // Get detailed profile data including activity history
    const profileData = {
      ...friend.toObject(),
      activityData: friend.leetcodeData.activityHistory || [],
      progressData: friend.leetcodeData.progressHistory || {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        easy: [0, 0, 0, 0, 0, 0],
        medium: [0, 0, 0, 0, 0, 0],
        hard: [0, 0, 0, 0, 0, 0]
      },
      recentSubmissions: friend.leetcodeData.recentSubmissions || [],
      contests: friend.leetcodeData.contestHistory || []
    };

    return res
      .status(200)
      .json(new ApiResponse(200, profileData, 'Profile data fetched successfully'));

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    throw new ApiError(500, 'Error fetching profile data');
  }
}));

// Update friend's LeetCode data (trigger refresh)
router.post('/refresh/:friendId', verifyJWT, asyncHandler(async (req, res) => {
  const { friendId } = req.params;
  
  try {
    const friend = await Friend.findById(friendId);
    
    if (!friend) {
      throw new ApiError(404, 'Friend not found');
    }

    // Check if this friend belongs to the current user
    const user = await User.findById(req.user._id);
    if (!user.friends.includes(friend._id)) {
      throw new ApiError(403, 'Access denied to refresh this friend');
    }

    // Trigger background scraping (you can implement queue system here)
    // For now, just update the last refresh timestamp
    friend.leetcodeData.lastRefreshAttempt = new Date();
    friend.leetcodeData.isBeingScraped = true;
    await friend.save();

    // Here you would typically add a job to a queue to scrape the data
    // For example: await scrapingQueue.add('scrape-friend', { friendId });

    return res
      .status(200)
      .json(new ApiResponse(200, {
        message: 'Refresh initiated',
        friendId,
        estimatedTime: '30-60 seconds'
      }, 'Friend data refresh started'));

  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    throw new ApiError(500, 'Error initiating refresh');
  }
}));

// Get dashboard statistics
router.get('/dashboard-stats', verifyJWT, asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends');
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const friends = user.friends;
    
    // Calculate statistics
    const stats = {
      totalFriends: friends.length,
      totalProblems: friends.reduce((sum, f) => sum + (f.leetcodeData.totalSolved || 0), 0),
      averageRating: friends.length > 0 
        ? Math.round(friends.reduce((sum, f) => sum + (f.leetcodeData.contestRating || 0), 0) / friends.length)
        : 0,
      recentSolves: friends.reduce((sum, f) => sum + (f.leetcodeData.weeklyProgress || 0), 0)
    };

    // Get recent activity
    const recentActivity = friends
      .flatMap(friend => 
        (friend.leetcodeData.recentSubmissions || []).map(submission => ({
          friendId: friend._id,
          friendName: friend.name,
          friendAvatar: friend.avatar,
          ...submission
        }))
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    return res
      .status(200)
      .json(new ApiResponse(200, {
        stats,
        recentActivity,
        friends: friends.slice(0, 5) // Top 5 friends for quick display
      }, 'Dashboard stats fetched successfully'));

  } catch (error) {
    throw new ApiError(500, 'Error fetching dashboard statistics');
  }
}));

export default router;
