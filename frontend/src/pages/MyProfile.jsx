import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiRefreshCw, FiAward, FiTrendingUp, FiCalendar, FiExternalLink } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getMyProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await userAPI.refreshMyProfile();
      await fetchProfile();
    } catch (error) {
      console.error('Error refreshing profile:', error);
      alert('Failed to refresh profile');
    } finally {
      setRefreshing(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'hard':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-xl text-gray-400 mb-6">You haven't set up your LeetCode profile yet</p>
            <button
              onClick={() => navigate('/complete-profile')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all"
            >
              Set Up Profile
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <FiArrowLeft />
          <span>Back to Dashboard</span>
        </motion.button>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-4xl text-white font-bold">
              {profile.name?.charAt(0) || 'U'}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full border border-blue-500/30">
                  You
                </span>
              </div>
              <p className="text-xl text-gray-400 mb-4">@{profile.leetcodeId}</p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 text-gray-300">
                  <FiAward className="text-yellow-400" />
                  <span>Rank: {profile.ranking ? `#${profile.ranking.toLocaleString()}` : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <FiTrendingUp className="text-green-400" />
                  <span>Contest: {profile.contestRating || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <FiCalendar className="text-orange-400" />
                  <span>Streak: {profile.streak || 0} days</span>
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Solved */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-lg rounded-xl border border-blue-500/30 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-300 font-medium">Total Solved</h3>
              <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center">
                <FiAward className="text-blue-400" />
              </div>
            </div>
            <p className="text-4xl font-bold text-white mb-2">{profile.totalSolved || 0}</p>
            <p className="text-sm text-gray-400">Problems completed</p>
          </motion.div>

          {/* Easy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-xl border border-green-500/30 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-300 font-medium">Easy</h3>
              <div className="w-10 h-10 bg-green-500/30 rounded-lg flex items-center justify-center">
                <span className="text-green-400 font-bold">E</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-white mb-2">{profile.easySolved || 0}</p>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((profile.easySolved / 200) * 100, 100)}%` }}
              ></div>
            </div>
          </motion.div>

          {/* Medium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-xl border border-yellow-500/30 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-300 font-medium">Medium</h3>
              <div className="w-10 h-10 bg-yellow-500/30 rounded-lg flex items-center justify-center">
                <span className="text-yellow-400 font-bold">M</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-white mb-2">{profile.mediumSolved || 0}</p>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((profile.mediumSolved / 300) * 100, 100)}%` }}
              ></div>
            </div>
          </motion.div>

          {/* Hard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-lg rounded-xl border border-red-500/30 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-300 font-medium">Hard</h3>
              <div className="w-10 h-10 bg-red-500/30 rounded-lg flex items-center justify-center">
                <span className="text-red-400 font-bold">H</span>
              </div>
            </div>
            <p className="text-4xl font-bold text-white mb-2">{profile.hardSolved || 0}</p>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((profile.hardSolved / 100) * 100, 100)}%` }}
              ></div>
            </div>
          </motion.div>
        </div>

        {/* Recent Submissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Recent Submissions</h2>
          
          {profile.recentSubmissions && profile.recentSubmissions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.recentSubmissions.slice(0, 50).map((submission, index) => (
                <motion.a
                  key={index}
                  href={`https://leetcode.com/problems/${submission.titleSlug}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.01 }}
                  className="bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 p-4 transition-all duration-300 hover:scale-105 hover:border-blue-400/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-white font-medium text-sm flex-1 pr-2">
                      {submission.title}
                    </h3>
                    <FiExternalLink className="text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      submission.statusDisplay === 'Accepted' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {submission.statusDisplay}
                    </span>
                    {submission.lang && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {submission.lang}
                      </span>
                    )}
                  </div>
                  {submission.timestamp && (
                    <p className="text-xs text-gray-500 mt-2">
                      {submission.timestamp}
                    </p>
                  )}
                </motion.a>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No recent submissions</p>
          )}
        </motion.div>
      </main>

      <div className="opacity-100">
        <Footer />
      </div>
    </div>
  );
};

export default MyProfile;
