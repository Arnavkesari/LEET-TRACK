// Base API configuration
const API_BASE_URL = '/api/v1'; // Using proxy, so relative path

// Helper function to make HTTP requests
const makeRequest = async (url, options = {}) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for auth
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    // Check if response has content before parsing JSON
    const contentType = response.headers.get('content-type');
    let data = null;
    
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      data = text ? JSON.parse(text) : null;
    }

    if (!response.ok) {
      throw new Error(data?.message || `Request failed with status ${response.status}`);
    }

    return data?.data || data;
  } catch (error) {
    // If it's a network error (server not running, CORS, etc.)
    if (error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please make sure the backend is running.');
    }
    throw error;
  }
};

// Authentication APIs
export const authAPI = {
  // Register new user
  register: async (userData) => {
    return makeRequest('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login user
  login: async (credentials) => {
    return makeRequest('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Logout user
  logout: async () => {
    return makeRequest('/users/logout', {
      method: 'POST',
    });
  },

  // Get current user
  getCurrentUser: async () => {
    return makeRequest('/auth/current-user');
  },

  // Get Google Auth URL
  getGoogleAuthURL: async () => {
    return makeRequest('/auth/google/url');
  },

  // Google Auth with token
  googleAuth: async (token) => {
    return makeRequest('/auth/google/token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  // Set LeetCode ID (for profile completion)
  setLeetCodeId: async (leetcodeId) => {
    return makeRequest('/users/set-leetcode-id', {
      method: 'POST',
      body: JSON.stringify({ leetcodeId }),
    });
  },
};

// Friends APIs
export const friendsAPI = {
  // Add a new friend
  addFriend: async (leetcodeId) => {
    return makeRequest('/friends', {
      method: 'POST',
      body: JSON.stringify({ leetcodeId }),
    });
  },

  // Get all friends
  getFriends: async () => {
    return makeRequest('/friends');
  },

  // Remove a friend
  removeFriend: async (friendId) => {
    return makeRequest(`/friends/${friendId}`, {
      method: 'DELETE',
    });
  },

  // Refresh friend data
  refreshFriend: async (friendId) => {
    return makeRequest(`/friends/${friendId}/update`, {
      method: 'PATCH',
    });
  },
  
  // Get leaderboard
  getLeaderboard: async (sortBy = 'totalSolved', timeFilter = 'allTime') => {
    return makeRequest(`/friends/leaderboard?sortBy=${sortBy}&timeFilter=${timeFilter}`);
  },
  
  // Get friend details by ID
  getFriendById: async (friendId) => {
    return makeRequest(`/friends/${friendId}`);
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    return makeRequest('/dashboard/dashboard-stats');
  },
  getLeaderboard: async (sortBy = 'totalSolved', timeFilter = 'allTime') => {
    return makeRequest(`/dashboard/leaderboard?sortBy=${sortBy}&timeFilter=${timeFilter}`);
  },
  refreshAllFriends: async () => {
    return makeRequest('/dashboard/refresh-all', {
      method: 'POST',
    });
  },
};

// User APIs
export const userAPI = {
  // Update user profile
  updateProfile: async (profileData) => {
    return makeRequest('/users/update-profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },

  // Change password
  changePassword: async (passwordData) => {
    return makeRequest('/users/change-password', {
      method: 'PATCH',
      body: JSON.stringify(passwordData),
    });
  },

  // Update LeetCode profile
  updateLeetCodeProfile: async (leetcodeData) => {
    return makeRequest('/users/leetcode-profile', {
      method: 'PATCH',
      body: JSON.stringify(leetcodeData),
    });
  },

  // Get user's own profile (with LeetCode data)
  getMyProfile: async () => {
    return makeRequest('/users/my-profile');
  },

  // Refresh user's own profile data
  refreshMyProfile: async () => {
    return makeRequest('/users/refresh-profile', {
      method: 'POST',
    });
  },

  // Get user stats
  getUserStats: async () => {
    return makeRequest('/users/stats');
  },
};

// Challenge APIs
export const challengesAPI = {
  // Create a new challenge
  createChallenge: async (challengeData) => {
    return makeRequest('/challenges', {
      method: 'POST',
      body: JSON.stringify(challengeData),
    });
  },

  // Get all challenges
  getAllChallenges: async (status) => {
    const url = status ? `/challenges?status=${status}` : '/challenges';
    return makeRequest(url);
  },

  // Get active challenges
  getActiveChallenges: async () => {
    return makeRequest('/challenges/active');
  },

  // Get pending challenges
  getPendingChallenges: async () => {
    return makeRequest('/challenges/pending');
  },

  // Get challenge history
  getChallengeHistory: async (limit = 10) => {
    return makeRequest(`/challenges/history?limit=${limit}`);
  },

  // Get challenge details
  getChallengeDetails: async (challengeId) => {
    return makeRequest(`/challenges/${challengeId}`);
  },

  // Accept a challenge
  acceptChallenge: async (challengeId) => {
    return makeRequest(`/challenges/${challengeId}/accept`, {
      method: 'PATCH',
    });
  },

  // Decline a challenge
  declineChallenge: async (challengeId) => {
    return makeRequest(`/challenges/${challengeId}/decline`, {
      method: 'PATCH',
    });
  },

  // Cancel a challenge
  cancelChallenge: async (challengeId) => {
    return makeRequest(`/challenges/${challengeId}/cancel`, {
      method: 'PATCH',
    });
  },

  // Update challenge progress
  updateProgress: async (challengeId, solved) => {
    return makeRequest(`/challenges/${challengeId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ solved }),
    });
  },

  // Get challenge statistics
  getChallengeStats: async () => {
    return makeRequest('/challenges/stats');
  },
};

// Main API object with all methods
const api = {
  // Auth methods
  register: authAPI.register,
  login: authAPI.login,
  logout: authAPI.logout,
  getCurrentUser: authAPI.getCurrentUser,
  googleAuth: authAPI.googleAuth,
  getGoogleAuthURL: authAPI.getGoogleAuthURL,

  // Friends methods
  addFriend: friendsAPI.addFriend,
  getFriends: friendsAPI.getFriends,
  removeFriend: friendsAPI.removeFriend,
  refreshFriend: friendsAPI.refreshFriend,
  getFriendsLeaderboard: friendsAPI.getLeaderboard,

  // Dashboard methods
  getStats: dashboardAPI.getStats,
  getDashboardLeaderboard: dashboardAPI.getLeaderboard,

  // User methods
  updateProfile: userAPI.updateProfile,
  changePassword: userAPI.changePassword,
  updateLeetCodeProfile: userAPI.updateLeetCodeProfile,
  getUserStats: userAPI.getUserStats,

  // Challenge methods
  createChallenge: challengesAPI.createChallenge,
  getAllChallenges: challengesAPI.getAllChallenges,
  getActiveChallenges: challengesAPI.getActiveChallenges,
  getPendingChallenges: challengesAPI.getPendingChallenges,
  getChallengeHistory: challengesAPI.getChallengeHistory,
  getChallengeDetails: challengesAPI.getChallengeDetails,
  acceptChallenge: challengesAPI.acceptChallenge,
  declineChallenge: challengesAPI.declineChallenge,
  cancelChallenge: challengesAPI.cancelChallenge,
  updateChallengeProgress: challengesAPI.updateProgress,
  getChallengeStats: challengesAPI.getChallengeStats,
};

export default api;
