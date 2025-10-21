import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiTrendingUp, 
  FiAward, 
  FiUsers, 
  FiFilter,
  FiSearch,
  FiCalendar,
  FiTarget,
  FiZap
} from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LeaderboardCard from '../components/LeaderboardCard';
import FilterDropdown from '../components/FilterDropdown';

const Leaderboard = () => {
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('totalSolved');
  const [timeFilter, setTimeFilter] = useState('allTime');

  // Fetch real leaderboard data
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        const { friendsAPI } = await import('../services/api');
        const leaderboardData = await friendsAPI.getLeaderboard(sortBy, timeFilter);
        setFriends(leaderboardData || []);
        setFilteredFriends(leaderboardData || []);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        setFriends([]);
        setFilteredFriends([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [sortBy, timeFilter]);

  // Filter logic (sorting is done on backend)
  useEffect(() => {
    let filtered = friends.filter(friend =>
      friend.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.leetcodeId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Add current rank based on position
    filtered = filtered.map((friend, index) => ({
      ...friend,
      currentRank: index + 1
    }));

    setFilteredFriends(filtered);
  }, [friends, searchTerm]);

  const sortOptions = [
    { value: 'totalSolved', label: 'Total Problems Solved' },
    { value: 'contestRating', label: 'Contest Rating' },
    { value: 'streak', label: 'Current Streak' },
    { value: 'weeklyProgress', label: 'Weekly Progress' },
    { value: 'ranking', label: 'Global Ranking' }
  ];

  const timeFilterOptions = [
    { value: 'allTime', label: 'All Time' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'today', label: 'Today' }
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🏆 Leaderboard
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              See how you and your friends rank against each other. Competition breeds excellence!
            </p>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <FiUsers className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{friends.length}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Competitors</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <FiTarget className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {friends.reduce((sum, f) => sum + (f.leetcodeData?.totalSolved || 0), 0)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Combined Solves</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <FiZap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {friends.length > 0 
                ? Math.round(friends.reduce((sum, f) => sum + (f.leetcodeData?.contestRating || 0), 0) / friends.length)
                : 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
            <FiTrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {friends.reduce((sum, f) => sum + (f.leetcodeData?.streak || 0), 0)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Streaks</p>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <FilterDropdown
                options={sortOptions}
                value={sortBy}
                onChange={setSortBy}
                placeholder="Sort by"
                icon={FiFilter}
              />
              <FilterDropdown
                options={timeFilterOptions}
                value={timeFilter}
                onChange={setTimeFilter}
                placeholder="Time period"
                icon={FiCalendar}
              />
            </div>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Rankings
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend, index) => (
                <LeaderboardCard
                  key={friend.id}
                  friend={friend}
                  rank={friend.currentRank || index + 1}
                  sortBy={sortBy}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No friends found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filters.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Leaderboard;
