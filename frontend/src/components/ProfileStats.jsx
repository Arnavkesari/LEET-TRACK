import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiCalendar, FiPercent, FiHash } from 'react-icons/fi';

const ProfileStats = ({ friend }) => {
  const getDifficultyProgress = (easy, medium, hard, total) => {
    return {
      easy: (easy / total) * 100,
      medium: (medium / total) * 100,
      hard: (hard / total) * 100
    };
  };

  const progress = getDifficultyProgress(
    friend.stats.easy,
    friend.stats.medium,
    friend.stats.hard,
    friend.stats.totalSolved
  );

  const statsData = [
    {
      label: 'Acceptance Rate',
      value: `${friend.stats.acceptanceRate}%`,
      icon: FiPercent,
      color: 'green'
    },
    {
      label: 'Total Submissions',
      value: friend.stats.totalSubmissions.toLocaleString(),
      icon: FiHash,
      color: 'blue'
    },
    {
      label: 'Max Streak',
      value: `${friend.stats.maxStreak} days`,
      icon: FiTrendingUp,
      color: 'orange'
    },
    {
      label: 'Member Since',
      value: new Date(friend.joinedDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      }),
      icon: FiCalendar,
      color: 'purple'
    }
  ];

  const colorClasses = {
    green: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    orange: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Statistics
        </h3>
      </div>
      <div className="p-6 space-y-6">
        {/* Problem Distribution */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Problem Distribution
          </h4>
          <div className="space-y-3">
            {/* Easy */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Easy</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {friend.stats.easy}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.easy}%` }}
              ></div>
            </div>

            {/* Medium */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Medium</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {friend.stats.medium}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.medium}%` }}
              ></div>
            </div>

            {/* Hard */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Hard</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {friend.stats.hard}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.hard}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className={`inline-flex p-2 rounded-lg ${colorClasses[stat.color]} mb-2`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Progress This Month */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            This Month's Progress
          </h4>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Problems Solved
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {friend.stats.monthlyProgress}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((friend.stats.monthlyProgress / 100) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Goal: 100</span>
            <span>{Math.round((friend.stats.monthlyProgress / 100) * 100)}% complete</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;
