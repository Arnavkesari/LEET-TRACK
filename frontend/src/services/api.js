// Base API configuration
const API_BASE_URL = '/api/v1'; // Using proxy, so relative path

// Helper function to make HTTP requests
const makeRequest = async (url, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for auth
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data.data || data;
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

  // Get user stats
  getUserStats: async () => {
    return makeRequest('/users/stats');
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
};

export default api;
