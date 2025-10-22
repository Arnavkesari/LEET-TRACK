import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiExternalLink, 
  FiTrendingUp, 
  FiAward,
  FiTarget,
  FiZap,
  FiClock,
  FiCheckCircle
} from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';

const FriendProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [friend, setFriend] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriendData = async () => {
      try {
        setLoading(true);
        const { friendsAPI } = await import('../services/api');
        const friendData = await friendsAPI.getFriendById(username);
        
        // Transform backend data to match component structure
        const transformedData = {
          id: friendData._id,
          name: friendData.name,
          leetcodeUsername: friendData.leetcodeId,
          avatar: friendData.avatar || `https://ui-avatars.com/api/?name=${friendData.name}&background=random`,
          bio: `LeetCode enthusiast with ${friendData.leetcodeData?.totalSolved || 0} problems solved`,
          location: "Unknown",
          joinedDate: new Date(friendData.createdAt).toLocaleDateString(),
          recentSubmissions: friendData.leetcodeData?.recentSubmissions || [],
          stats: {
            totalSolved: friendData.leetcodeData?.totalSolved || 0,
            easy: friendData.leetcodeData?.easySolved || 0,
            medium: friendData.leetcodeData?.mediumSolved || 0,
            hard: friendData.leetcodeData?.hardSolved || 0,
            ranking: friendData.leetcodeData?.ranking || 0,
            contestRating: friendData.leetcodeData?.contestRating || 0,
            streak: friendData.leetcodeData?.streak || 0,
            maxStreak: friendData.leetcodeData?.streak || 0,
            weeklyProgress: 0,
            monthlyProgress: 0,
            acceptanceRate: friendData.leetcodeData?.acceptanceRate || 0,
            totalSubmissions: friendData.leetcodeData?.totalSolved || 0
          }
        };
        
        setFriend(transformedData);
      } catch (error) {
        console.error('Failed to fetch friend data:', error);
        setFriend(null);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchFriendData();
    }
  }, [username]);

  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy':
        return 'text-green-400 bg-green-400/10';
      case 'medium':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'hard':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
        <Footer />
      </div>
    );
  }

  if (!friend) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Friend not found
            </h2>
            <p className="text-gray-400 mb-6">
              The profile you're looking for doesn't exist.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-lg text-sm font-medium text-white transition-all"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-300 hover:text-white transition-colors"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
        </motion.div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 mb-8 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Profile Overview</h2>
          </div>
          <div className="px-6 py-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="h-28 w-28 rounded-full object-cover border-4 border-blue-500/30 shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 bg-green-500 h-6 w-6 rounded-full border-4 border-gray-800"></div>
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                      {friend.name}
                    </h1>
                    <p className="text-lg text-blue-400 font-medium">
                      @{friend.leetcodeUsername}
                    </p>
                    {friend.location && (
                      <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                        <span>📍</span> {friend.location}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-4 sm:mt-0 flex space-x-3">
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={`https://leetcode.com/${friend.leetcodeUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg shadow-lg text-sm font-medium text-white transition-all"
                    >
                      <FiExternalLink className="mr-2 h-4 w-4" />
                      View on LeetCode
                    </motion.a>
                  </div>
                </div>

                {friend.bio && (
                  <p className="mt-4 text-gray-300 max-w-2xl leading-relaxed">
                    {friend.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-8">
          {/* Stats Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-11">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center mx-auto w-full bg-gray-700/30 rounded-xl p-6 border border-gray-600 hover:border-blue-500 transition-all"
                >
                  <div className="bg-blue-500/20 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3">
                    <FiTarget className="h-6 w-6 text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {friend.stats.totalSolved}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">Total Solved</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center mx-auto w-full bg-gray-700/30 rounded-xl p-6 border border-gray-600 hover:border-purple-500 transition-all"
                >
                  <div className="bg-purple-500/20 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3">
                    <FiAward className="h-6 w-6 text-purple-400" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {friend.stats.contestRating}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">Contest Rating</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center mx-auto w-full bg-gray-700/30 rounded-xl p-6 border border-gray-600 hover:border-orange-500 transition-all"
                >
                  <div className="bg-orange-500/20 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3">
                    <FiZap className="h-6 w-6 text-orange-400" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    {friend.stats.streak}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">Current Streak</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="text-center mx-auto w-full bg-gray-700/30 rounded-xl p-6 border border-gray-600 hover:border-green-500 transition-all"
                >
                  <div className="bg-green-500/20 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-3">
                    <FiTrendingUp className="h-6 w-6 text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">
                    #{friend.stats.ranking.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">Global Rank</p>
                </motion.div>
              </div>

              {/* Difficulty Breakdown */}
              <div className="max-w-4xl mx-auto">
                <h3 className="text-xl font-bold text-white mb-6 text-center">Problem Difficulty Breakdown</h3>
                <div className="bg-gray-700/30 rounded-xl p-8 border border-gray-600 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-semibold text-green-400 flex items-center gap-2">
                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        Easy
                      </span>
                      <span className="text-xl font-bold text-white">{friend.stats.easy}</span>
                    </div>
                    <div className="bg-gray-600/50 rounded-full h-5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${friend.stats.easy > 0 ? Math.min((friend.stats.easy / 500) * 100, 100) : 0}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="bg-gradient-to-r from-green-500 to-green-400 h-5 rounded-full shadow-lg shadow-green-500/50"
                      />
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                        Medium
                      </span>
                      <span className="text-xl font-bold text-white">{friend.stats.medium}</span>
                    </div>
                    <div className="bg-gray-600/50 rounded-full h-5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${friend.stats.medium > 0 ? Math.min((friend.stats.medium / 1000) * 100, 100) : 0}%` }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-5 rounded-full shadow-lg shadow-yellow-500/50"
                      />
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-semibold text-red-400 flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        Hard
                      </span>
                      <span className="text-xl font-bold text-white">{friend.stats.hard}</span>
                    </div>
                    <div className="bg-gray-600/50 rounded-full h-5 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${friend.stats.hard > 0 ? Math.min((friend.stats.hard / 500) * 100, 100) : 0}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="bg-gradient-to-r from-red-500 to-red-400 h-5 rounded-full shadow-lg shadow-red-500/50"
                      />
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-6 py-5 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="bg-blue-500/20 rounded-lg p-2">
                    <FiClock className="h-6 w-6 text-blue-400" />
                  </div>
                  Recent Submissions
                </h3>
                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                  {friend.recentSubmissions.length} solved
                </span>
              </div>
            </div>

            <style jsx>{`
              .scrollbar-custom::-webkit-scrollbar {
                width: 8px;
              }
              .scrollbar-custom::-webkit-scrollbar-track {
                background: rgb(31 41 55);
                border-radius: 4px;
              }
              .scrollbar-custom::-webkit-scrollbar-thumb {
                background: rgb(59 130 246);
                border-radius: 4px;
              }
              .scrollbar-custom::-webkit-scrollbar-thumb:hover {
                background: rgb(37 99 235);
              }
            `}</style>

            <div className="max-h-[600px] overflow-y-auto scrollbar-custom">
              {friend.recentSubmissions.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="bg-gradient-to-br from-gray-700/30 to-gray-700/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <FiClock className="h-12 w-12 text-gray-500" />
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">No Recent Submissions</h4>
                  <p className="text-gray-400 text-sm">This user hasn't solved any problems recently</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {friend.recentSubmissions.map((submission, index) => (
                    <motion.div
                      key={`${submission.titleSlug}-${index}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ y: -5 }}
                      className="group"
                    >
                      <div className="bg-gray-700/30 hover:bg-gray-700/50 rounded-xl p-5 border border-gray-600 hover:border-blue-500 transition-all h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={friend.avatar}
                              alt={friend.name}
                              className="h-8 w-8 rounded-full border-2 border-blue-500/50"
                            />
                            <span className="text-xs font-medium text-gray-400 truncate max-w-[120px]">
                              {friend.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-green-500/20 px-2.5 py-1 rounded-full">
                            <FiCheckCircle className="h-3.5 w-3.5 text-green-400" />
                            <span className="text-xs font-medium text-green-300">Accepted</span>
                          </div>
                        </div>

                        <div className="flex-1 mb-4">
                          {submission.titleSlug ? (
                            <a
                              href={`https://leetcode.com/problems/${submission.titleSlug}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-base font-semibold text-white hover:text-blue-400 transition-colors flex items-start gap-2 group/link"
                            >
                              <span className="line-clamp-2">{submission.title}</span>
                              <FiExternalLink className="h-4 w-4 flex-shrink-0 text-gray-500 group-hover/link:text-blue-400 opacity-0 group-hover/link:opacity-100 transition-all mt-0.5" />
                            </a>
                          ) : (
                            <p className="text-base font-semibold text-white line-clamp-2">
                              {submission.title}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-600/50">
                          <span className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${getDifficultyColor('Medium')}`}>
                            Medium
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <FiClock className="h-3.5 w-3.5" />
                            <span>
                              {submission.timestamp ? new Date(submission.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FriendProfile;