import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiTrendingUp, 
  FiAward, 
  FiCalendar,
  FiPlus,
  FiRefreshCw,
  FiBarChart2,
  FiTarget
} from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FriendCard from '../components/FriendCard';
import AddFriendModal from '../components/AddFriendModal';
import RecentActivity from '../components/RecentActivity';
import StatsCard from '../components/StatsCard';

import { friendsAPI, dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [stats, setStats] = useState({
    totalFriends: 0,
    totalProblems: 0,
    averageRating: 0,
    recentSolves: 0
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setError(null);
      const response = await dashboardAPI.getStats();
      
      // response contains: { stats, recentActivity, friends }
      setFriends(response.friends || []);
      setStats(response.stats || {
        totalFriends: 0,
        totalProblems: 0,
        averageRating: 0,
        recentSolves: 0
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Call the refresh-all endpoint to scrape fresh data
      const response = await dashboardAPI.refreshAllFriends();
      console.log('Refresh results:', response);
      
      // Fetch updated data from database
      await fetchData();
      
      // Show success message
      if (response.updated > 0) {
        console.log(`Successfully updated ${response.updated} friends`);
      }
      if (response.failed > 0) {
        console.warn(`Failed to update ${response.failed} friends`);
      }
    } catch (err) {
      console.error('Failed to refresh friends:', err);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddFriend = async (leetcodeId) => {
    try {
      await friendsAPI.addFriend(leetcodeId);
      await fetchData(); // Refresh data after adding
    } catch (err) {
      console.error('Failed to add friend:', err);
      // Re-throw error to be handled by the modal
      throw err;
    }
  };

  const handleRemoveFriend = async (leetcodeId) => {
    try {
      await friendsAPI.removeFriend(leetcodeId);
      setFriends(friends.filter(f => f.leetcodeId !== leetcodeId));
      await fetchData(); // Refresh stats
    } catch (err) {
      console.error('Failed to remove friend:', err);
    }
  };

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
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.fullName || 'User'}! 👋
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Track your LeetCode progress and compete with friends
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                <FiRefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Add Friend
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatsCard
            title="Total Friends"
            value={stats.totalFriends}
            icon={FiUsers}
            color="blue"
          />
          <StatsCard
            title="Combined Problems"
            value={stats.totalProblems}
            icon={FiTarget}
            color="green"
          />
          <StatsCard
            title="Average Rating"
            value={stats.averageRating}
            icon={FiAward}
            color="purple"
          />
          <StatsCard
            title="Recent Solves"
            value={stats.recentSolves}
            icon={FiTrendingUp}
            color="orange"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Friends List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Your Friends
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {friends.length} friends
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {friends.length > 0 ? (
                  friends.map((friend) => (
                    <FriendCard
                      key={friend.leetcodeId}
                      friend={friend}
                      onRemove={() => handleRemoveFriend(friend.leetcodeId)}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      No friends yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Start by adding your first friend to track their progress.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <FiPlus className="mr-2 h-4 w-4" />
                        Add Friend
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Recent Activity */}
            <RecentActivity friends={friends} />
          </motion.div>
        </div>
      </main>

      <div className="opacity-100">
        <Footer />
      </div>

      {/* Add Friend Modal */}
      <AddFriendModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddFriend}
        loading={refreshing}
      />
    </div>
  );
};

export default Dashboard;
