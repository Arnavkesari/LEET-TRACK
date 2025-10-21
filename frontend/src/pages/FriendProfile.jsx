import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiExternalLink, 
  FiTrendingUp, 
  FiCalendar,
  FiAward,
  FiTarget,
  FiZap,
  FiClock,
  FiBarChart2,
  FiGitBranch
} from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProfileStats from '../components/ProfileStats';
import ActivityChart from '../components/ActivityChart';
import RecentSubmissions from '../components/RecentSubmissions';
import ProgressChart from '../components/ProgressChart';

const FriendProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [friend, setFriend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Mock API call - replace with actual API
    const mockFriendData = {
      id: 1,
      name: "Alex Johnson",
      leetcodeUsername: "alexcoder",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      bio: "Software Engineer passionate about algorithms and data structures. Always up for a coding challenge!",
      location: "San Francisco, CA",
      joinedDate: "2021-03-15",
      stats: {
        totalSolved: 845,
        easy: 285,
        medium: 427,
        hard: 133,
        ranking: 5420,
        contestRating: 2150,
        streak: 42,
        maxStreak: 67,
        weeklyProgress: 15,
        monthlyProgress: 67,
        acceptanceRate: 73.2,
        totalSubmissions: 1156
      },
      badges: ['Problem Solver', 'Contest Expert', 'Daily Warrior', 'Algorithm Master'],
      skills: ['Dynamic Programming', 'Graph Algorithms', 'Binary Trees', 'Backtracking'],
      recentSubmissions: [
        {
          id: 1,
          problem: "Longest Increasing Subsequence",
          difficulty: "Medium",
          status: "Accepted",
          runtime: "72ms",
          memory: "45.2MB",
          timestamp: "2 hours ago",
          language: "Python3"
        },
        {
          id: 2,
          problem: "Binary Tree Maximum Path Sum",
          difficulty: "Hard",
          status: "Accepted",
          runtime: "156ms",
          memory: "23.1MB",
          timestamp: "4 hours ago",
          language: "Java"
        },
        {
          id: 3,
          problem: "Valid Parentheses",
          difficulty: "Easy",
          status: "Accepted",
          runtime: "32ms",
          memory: "14.2MB",
          timestamp: "6 hours ago",
          language: "C++"
        },
        {
          id: 4,
          problem: "Word Break II",
          difficulty: "Hard",
          status: "Wrong Answer",
          runtime: "-",
          memory: "-",
          timestamp: "8 hours ago",
          language: "Python3"
        }
      ],
      activityData: [
        { date: '2024-01-01', count: 3 },
        { date: '2024-01-02', count: 5 },
        { date: '2024-01-03', count: 2 },
        { date: '2024-01-04', count: 4 },
        { date: '2024-01-05', count: 1 },
        { date: '2024-01-06', count: 6 },
        { date: '2024-01-07', count: 3 }
      ],
      progressData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        easy: [45, 52, 61, 73, 89, 95],
        medium: [23, 31, 45, 67, 89, 127],
        hard: [5, 8, 12, 18, 25, 29]
      },
      contests: [
        { name: "Weekly Contest 385", rank: 234, rating: 2150, change: +25 },
        { name: "Biweekly Contest 125", rank: 189, rating: 2125, change: +18 },
        { name: "Weekly Contest 384", rank: 445, rating: 2107, change: -12 }
      ]
    };

    setTimeout(() => {
      setFriend(mockFriendData);
      setLoading(false);
    }, 1000);
  }, [username]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBarChart2 },
    { id: 'submissions', label: 'Submissions', icon: FiGitBranch },
    { id: 'progress', label: 'Progress', icon: FiTrendingUp },
    { id: 'contests', label: 'Contests', icon: FiAward }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
          />
        </div>
        <Footer />
      </div>
    );
  }

  if (!friend) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Friend not found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The profile you're looking for doesn't exist.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
        </motion.div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8"
        >
          <div className="px-6 py-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <img
                src={friend.avatar}
                alt={friend.name}
                className="h-24 w-24 rounded-full object-cover"
              />
              
              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {friend.name}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      @{friend.leetcodeUsername}
                    </p>
                    {friend.location && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        📍 {friend.location}
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
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <FiExternalLink className="mr-2 h-4 w-4" />
                      View on LeetCode
                    </motion.a>
                  </div>
                </div>

                {friend.bio && (
                  <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl">
                    {friend.bio}
                  </p>
                )}

                {/* Badges */}
                {friend.badges && friend.badges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {friend.badges.map((badge, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}

                {/* Skills */}
                {friend.skills && friend.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {friend.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <FiTarget className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {friend.stats.totalSolved}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Problems Solved</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <FiAward className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {friend.stats.contestRating}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Contest Rating</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <FiZap className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {friend.stats.streak}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <FiTrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              #{friend.stats.ranking.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Global Rank</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ProfileStats friend={friend} />
              <ActivityChart data={friend.activityData} />
            </div>
          )}
          
          {activeTab === 'submissions' && (
            <RecentSubmissions submissions={friend.recentSubmissions} />
          )}
          
          {activeTab === 'progress' && (
            <ProgressChart data={friend.progressData} />
          )}
          
          {activeTab === 'contests' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Contests
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {friend.contests.map((contest, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {contest.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Rank: #{contest.rank}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {contest.rating}
                        </div>
                        <div className={`text-sm ${
                          contest.change > 0 ? 'text-green-600' : contest.change < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {contest.change > 0 ? '+' : ''}{contest.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default FriendProfile;
