import axios from 'axios';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// LeetCode GraphQL endpoint and queries
const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 2;

const USER_PROFILE_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) { 
      username
      profile {
        realName
        userAvatar
        ranking
      }
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
    }
    recentSubmissionList(username: $username) {
      title
      titleSlug
      timestamp
      statusDisplay
      lang
    }
  }
`;

const USER_CONTEST_QUERY = `
  query getUserContest($username: String!) {
    userContestRanking(username: $username) {
      rating
    }
  }
`;

const USER_CALENDAR_QUERY = `
  query getUserCalendar($username: String!) {
    matchedUser(username: $username) {
      userCalendar {
        streak
      }
    }
  }
`;

class LeetCodeScraper {
  constructor() {
    this.maxRetries = MAX_RETRIES;
    this.axiosInstance = axios.create({
      baseURL: LEETCODE_GRAPHQL_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
  }

  validateUsername(username) {
    if (!username || typeof username !== 'string') {
      throw new ApiError(400, 'Username is required');
    }
    
    const trimmed = username.trim();
    
    if (trimmed.length < 1 || trimmed.length > 30) {
      throw new ApiError(400, 'Username must be between 1 and 30 characters');
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      throw new ApiError(400, 'Username can only contain letters, numbers, underscores, and hyphens');
    }
    
    return trimmed;
  }

  async withRetry(fn, retries = this.maxRetries) {
    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        console.log(`Attempt ${attempt}/${retries} failed:`, error.message);
        
        if (attempt < retries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    throw lastError;
  }

  async makeGraphQLRequest(query, variables) {
    try {
      const response = await this.axiosInstance.post('', {
        query,
        variables
      });

      const data = response.data;
      
      if (data.errors) {
        const errorMsg = data.errors[0]?.message || 'Unknown error';
        
        if (errorMsg.toLowerCase().includes('not found')) {
          return null;
        }
        
        throw new Error(`LeetCode API Error: ${errorMsg}`);
      }
      
      return data.data;
      
    } catch (error) {
      if (error.response) {
        // HTTP error
        throw new Error(`LeetCode API returned status ${error.response.status}`);
      } else if (error.request) {
        // Network error
        throw new Error('Unable to reach LeetCode. Please check your connection.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Request timeout. LeetCode might be slow or unavailable.');
      }
      
      throw error;
    }
  }

  async scrapeLeetCodeProfile(username) {
    try {
      // Validate username
      const validUsername = this.validateUsername(username);

      // Make parallel requests to LeetCode GraphQL API
      const [profileResponse, contestResponse, calendarResponse] = await Promise.all([
        this.makeGraphQLRequest(USER_PROFILE_QUERY, { username: validUsername }),
        this.makeGraphQLRequest(USER_CONTEST_QUERY, { username: validUsername }),
        this.makeGraphQLRequest(USER_CALENDAR_QUERY, { username: validUsername })
      ]);

      if (!profileResponse || !profileResponse.matchedUser) {
        return null;
      }

      const user = profileResponse.matchedUser;
      const contestData = contestResponse?.userContestRanking;
      const calendarData = calendarResponse?.matchedUser?.userCalendar;
      const recentSubmissions = profileResponse?.recentSubmissionList || [];

      const submitStats = user.submitStats?.acSubmissionNum || [];
      const easyStats = submitStats.find(s => s.difficulty === 'Easy') || { count: 0 };
      const mediumStats = submitStats.find(s => s.difficulty === 'Medium') || { count: 0 };
      const hardStats = submitStats.find(s => s.difficulty === 'Hard') || { count: 0 };

      const result = {
        name: user.profile?.realName || user.username,
        totalSolved: easyStats.count + mediumStats.count + hardStats.count,
        easySolved: easyStats.count,
        mediumSolved: mediumStats.count,
        hardSolved: hardStats.count,
        ranking: user.profile?.ranking || 0,
        contestRating: Math.floor(contestData?.rating || 0),
        streak: calendarData?.streak || 0,
        recentSubmissions: recentSubmissions
          .filter(sub => sub.statusDisplay === 'Accepted')
          .slice(0, 50)
          .map(sub => ({
            title: sub.title,
            titleSlug: sub.titleSlug,
            timestamp: sub.timestamp ? new Date(parseInt(sub.timestamp) * 1000) : new Date(),
            statusDisplay: sub.statusDisplay || 'Accepted',
            lang: sub.lang || 'Unknown'
          }))
      };

      return result;

    } catch (error) {
      // If it's already an ApiError, rethrow it
      if (error instanceof ApiError) {
        throw error;
      }
      
      console.error(`Error fetching LeetCode profile for ${username}:`, error.message);
      
      // Handle specific error types
      if (error.message.includes('timeout')) {
        throw new ApiError(504, 'Request timeout. LeetCode might be slow or unavailable.');
      }
      
      if (error.message.includes('Unable to reach')) {
        throw new ApiError(503, 'Unable to reach LeetCode. Please try again later.');
      }
      
      if (error.message.includes('status')) {
        throw new ApiError(502, 'LeetCode API is currently unavailable.');
      }
      
      throw new ApiError(500, 'Failed to fetch LeetCode profile. Please try again.');
    }
  }
}

const leetCodeScraper = new LeetCodeScraper();

const scrapeLeetCodeProfile = asyncHandler(async (req, res) => {
  const { leetcodeId } = req.params;
  
  const profileData = await leetCodeScraper.withRetry(async () => {
    return await leetCodeScraper.scrapeLeetCodeProfile(leetcodeId);
  });
  
  if (!profileData) {
    throw new ApiError(404, "LeetCode profile not found");
  }
  
  res.status(200).json(new ApiResponse(200, profileData, "LeetCode profile scraped successfully"));
});

const validateLeetCodeProfile = asyncHandler(async (req, res) => {
    const { leetcodeId } = req.params;
    try {
        const data = await leetCodeScraper.scrapeLeetCodeProfile(leetcodeId);
        res.status(200).json(new ApiResponse(200, { isValid: !!data, leetcodeId }, "Validation complete"));
    } catch (error) {
        res.status(200).json(new ApiResponse(200, { isValid: false, leetcodeId }, "Validation complete"));
    }
});

export {
  scrapeLeetCodeProfile,
  validateLeetCodeProfile,
  leetCodeScraper
};
