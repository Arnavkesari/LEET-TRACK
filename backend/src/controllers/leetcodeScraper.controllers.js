import puppeteer from 'puppeteer';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// LeetCode GraphQL endpoint and queries
const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

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
    this.browser = null;
    this.maxRetries = 2;
  }

  async initBrowser() {
    try {
      if (this.browser && this.browser.isConnected()) {
        return;
      }
      
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process'
        ],
        protocolTimeout: 30000,
      });

      // Handle browser disconnect
      this.browser.on('disconnected', () => {
        console.log('Browser disconnected');
        this.browser = null;
      });
      
    } catch (error) {
      console.error('Failed to initialize browser:', error);
      throw new Error('Failed to initialize web scraper');
    }
  }

  async closeBrowser() {
    if (this.browser) {
      try {
        await this.browser.close();
        this.browser = null;
      } catch (err) {
        console.log('Error closing browser:', err.message);
      }
    }
  }

  async withRetry(fn, retries = this.maxRetries) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        console.log(`Attempt ${attempt}/${retries} failed:`, error.message);
        
        if (attempt === retries) {
          throw error;
        }
        
        // Reset browser on connection errors
        if (error.message.includes('Target closed') || 
            error.message.includes('Connection closed') ||
            error.message.includes('Protocol error')) {
          await this.closeBrowser();
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        }
      }
    }
  }

  async makeGraphQLRequest(page, query, variables) {
    try {
      const response = await page.evaluate(async (url, query, variables) => {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Referer': 'https://leetcode.com/'
            },
            body: JSON.stringify({ query, variables })
          });
          return {
            ok: res.ok,
            status: res.status,
            text: await res.text()
          };
        } catch (err) {
          return {
            ok: false,
            status: 0,
            error: err.message
          };
        }
      }, LEETCODE_GRAPHQL_URL, query, variables);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch data from LeetCode`);
      }

      if (response.error) {
        throw new Error(`Network error: ${response.error}`);
      }

      const parsedResponse = JSON.parse(response.text);
      
      if (parsedResponse.errors) {
        const errorMsg = parsedResponse.errors[0]?.message || 'Unknown error';
        if (errorMsg.toLowerCase().includes("not found")) {
          return null;
        }
        throw new Error(`LeetCode API Error: ${errorMsg}`);
      }
      
      return parsedResponse.data;
      
    } catch (e) {
      if (e.message.includes('JSON')) {
        console.error("Failed to parse LeetCode API response");
        throw new Error("Invalid response from LeetCode API");
      }
      throw e;
    }
  }

  async scrapeLeetCodeProfile(username) {
    let page = null;
    
    try {
      await this.initBrowser();
      page = await this.browser.newPage();
      
      // Set timeout and user agent
      await page.setDefaultNavigationTimeout(30000);
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Navigate with timeout
      await page.goto('https://leetcode.com/' + username, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });

      // Add small delay to ensure page is ready
      await new Promise(resolve => setTimeout(resolve, 1000));

      const [profileResponse, contestResponse, calendarResponse] = await Promise.all([
        this.makeGraphQLRequest(page, USER_PROFILE_QUERY, { username }),
        this.makeGraphQLRequest(page, USER_CONTEST_QUERY, { username }),
        this.makeGraphQLRequest(page, USER_CALENDAR_QUERY, { username })
      ]);

      if (!profileResponse || !profileResponse.matchedUser) {
        // Return null if user not found. The controller will handle the 404 error.
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
      console.error(`Error scraping LeetCode profile for ${username}:`, error.message);
      console.error('Full error:', error);
      
      // Handle specific error types
      if (error.message.includes('Target closed') || error.message.includes('Connection closed')) {
        throw new Error('Failed to connect to LeetCode. Please try again.');
      }
      
      if (error.message.includes('Timeout')) {
        throw new Error('Request timeout. LeetCode might be slow or unavailable.');
      }
      
      throw new Error('Failed to fetch LeetCode profile. Please verify the username.');
      
    } finally {
      // Safely close the page
      if (page) {
        try {
          if (!page.isClosed()) {
            await page.close().catch(err => console.log('Error closing page:', err.message));
          }
        } catch (err) {
          console.log('Error in page cleanup:', err.message);
        }
      }
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
