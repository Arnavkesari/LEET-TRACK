import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { Friend } from '../models/friend.model.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { leetCodeScraper } from '../controllers/leetcodeScraper.controllers.js';

const router = Router();

// Get leaderboard data
router.get('/leaderboard', verifyJWT, asyncHandler(async (req, res) => {
  const { sortBy = 'totalSolved', timeFilter = 'allTime', limit = 50 } = req.query;
  
  try {
    // Get user's friends for leaderboard
    const user = await User.findById(req.user._id).select('friends');
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Get friends by their leetcode IDs
    let friends = await Friend.find({ 
      leetcodeId: { $in: user.friends || [] },
      isActive: true 
    });

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
    const friend = await Friend.findOne({ leetcodeId: username.toLowerCase() });
    
    if (!friend) {
      throw new ApiError(404, 'Friend profile not found');
    }

    // Check if this friend is in the current user's friends list
    const user = await User.findById(req.user._id).select('friends');
    if (!user.friends.includes(friend.leetcodeId)) {
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
router.post('/refresh/:leetcodeId', verifyJWT, asyncHandler(async (req, res) => {
  const { leetcodeId } = req.params;
  
  try {
    const normalizedLeetcodeId = leetcodeId.toLowerCase();
    const friend = await Friend.findOne({ leetcodeId: normalizedLeetcodeId });
    
    if (!friend) {
      throw new ApiError(404, 'Friend not found');
    }

    // Check if this friend is in the current user's friends list
    const user = await User.findById(req.user._id).select('friends');
    if (!user.friends.includes(friend.leetcodeId)) {
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
        leetcodeId: friend.leetcodeId,
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
    const user = await User.findById(req.user._id).select('friends');
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Get friends by their leetcode IDs
    const friends = await Friend.find({ 
      leetcodeId: { $in: user.friends || [] },
      isActive: true 
    });
    
    // Calculate statistics
    // Calculate recent solves (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentSolves = friends.reduce((total, friend) => {
      if (!friend.leetcodeData?.recentSubmissions) return total;
      
      // Count accepted submissions in last 7 days
      const recentCount = friend.leetcodeData.recentSubmissions.filter(submission => {
        const submissionDate = new Date(submission.timestamp * 1000); // Convert Unix timestamp to milliseconds
        return submissionDate >= sevenDaysAgo;
      }).length;
      
      return total + recentCount;
    }, 0);
    
    const stats = {
      totalFriends: friends.length,
      totalProblems: friends.reduce((sum, f) => sum + (f.leetcodeData.totalSolved || 0), 0),
      averageRating: friends.length > 0 
        ? Math.round(friends.reduce((sum, f) => sum + (f.leetcodeData.contestRating || 0), 0) / friends.length)
        : 0,
      recentSolves: recentSolves
    };

    // Get recent activity
    const recentActivity = friends
      .flatMap(friend => 
        (friend.leetcodeData.recentSubmissions || []).map(submission => ({
          friendId: friend.leetcodeId,
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

// Refresh all friends data - scrape fresh data from LeetCode
router.post('/refresh-all', verifyJWT, asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('friends');
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (!user.friends || user.friends.length === 0) {
      return res.status(200).json(
        new ApiResponse(200, { 
          message: 'No friends to refresh',
          updated: 0,
          failed: 0
        }, 'No friends found')
      );
    }

    // Get all friends
    const friends = await Friend.find({ 
      leetcodeId: { $in: user.friends },
      isActive: true 
    });

    const results = {
      total: friends.length,
      updated: 0,
      failed: 0,
      errors: []
    };

    // Scrape data for each friend
    for (const friend of friends) {
      try {
        // Mark as scraping
        friend.scrapingStatus = 'scraping';
        await friend.save();

        // Scrape fresh data
        const profileData = await leetCodeScraper.withRetry(async () => {
          return await leetCodeScraper.scrapeLeetCodeProfile(friend.leetcodeId);
        });

        if (profileData) {
          // Update friend data
          friend.name = profileData.name || friend.name;
          friend.leetcodeData = profileData;
          friend.scrapingStatus = 'success';
          friend.lastScrapedAt = new Date();
          await friend.save();
          results.updated++;
        } else {
          friend.scrapingStatus = 'failed';
          friend.lastScrapingError = 'Profile not found';
          await friend.save();
          results.failed++;
          results.errors.push({
            leetcodeId: friend.leetcodeId,
            error: 'Profile not found'
          });
        }
      } catch (error) {
        friend.scrapingStatus = 'failed';
        friend.lastScrapingError = error.message;
        await friend.save();
        results.failed++;
        results.errors.push({
          leetcodeId: friend.leetcodeId,
          error: error.message
        });
      }
    }

    return res.status(200).json(
      new ApiResponse(200, results, `Refreshed ${results.updated} friends successfully`)
    );

  } catch (error) {
    throw new ApiError(500, 'Error refreshing friends data');
  }
}));

export default router;
