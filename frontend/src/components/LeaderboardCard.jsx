import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiAward, FiTarget, FiZap, FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const LeaderboardCard = ({ friend, rank, sortBy }) => {
  const navigate = useNavigate();

  const getRankDisplay = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-600';
    if (rank === 2) return 'text-gray-600';
    if (rank === 3) return 'text-orange-600';
    return 'text-gray-500';
  };

  const getSortValue = (sortBy, leetcodeData) => {
    switch (sortBy) {
      case 'totalSolved':
        return leetcodeData?.totalSolved || 0;
      case 'contestRating':
        return leetcodeData?.contestRating || 0;
      case 'streak':
        return leetcodeData?.streak || 0;
      case 'weeklyProgress':
        return leetcodeData?.weeklyProgress || 0;
      case 'ranking':
        return leetcodeData?.ranking ? `#${leetcodeData.ranking.toLocaleString()}` : 'N/A';
      default:
        return leetcodeData?.totalSolved || 0;
    }
  };

  const getSortLabel = (sortBy) => {
    switch (sortBy) {
      case 'totalSolved':
        return 'Problems Solved';
      case 'contestRating':
        return 'Contest Rating';
      case 'streak':
        return 'Day Streak';
      case 'weeklyProgress':
        return 'This Week';
      case 'ranking':
        return 'Global Rank';
      default:
        return 'Problems Solved';
    }
  };

  const getDifficultyProgress = (easy, medium, hard, total) => {
    if (total === 0) return { easy: 0, medium: 0, hard: 0 };
    return {
      easy: (easy / total) * 100,
      medium: (medium / total) * 100,
      hard: (hard / total) * 100
    };
  };

  const leetcodeData = friend.leetcodeData || {};
  const progress = getDifficultyProgress(
    leetcodeData.easySolved || 0,
    leetcodeData.mediumSolved || 0,
    leetcodeData.hardSolved || 0,
    leetcodeData.totalSolved || 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
      onClick={() => navigate(`/profile/${friend.leetcodeId}`)}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Rank, Avatar, Name */}
        <div className="flex items-center space-x-4">
          {/* Rank */}
          <div className={`text-2xl font-bold ${getRankColor(rank)} min-w-[3rem] text-center`}>
            {getRankDisplay(rank)}
          </div>

          {/* Avatar and Info */}
          <div className="flex items-center space-x-3">
            <img
              src={friend.avatar}
              alt={friend.name}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {friend.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{friend.leetcodeId}
              </p>
              {/* Badges */}
              {leetcodeData.badges && leetcodeData.badges.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {leetcodeData.badges.slice(0, 2).map((badge, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      {badge.displayName || badge.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle - Stats */}
        <div className="hidden md:flex items-center space-x-8">
          {/* Problem Distribution */}
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Problems</div>
            <div className="flex items-center space-x-1 mb-1">
              <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full flex">
                  <div 
                    className="bg-green-500" 
                    style={{ width: `${progress.easy}%` }}
                  />
                  <div 
                    className="bg-yellow-500" 
                    style={{ width: `${progress.medium}%` }}
                  />
                  <div 
                    className="bg-red-500" 
                    style={{ width: `${progress.hard}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-x-2">
              <span className="text-green-600">{leetcodeData.easySolved || 0}E</span>
              <span className="text-yellow-600">{leetcodeData.mediumSolved || 0}M</span>
              <span className="text-red-600">{leetcodeData.hardSolved || 0}H</span>
            </div>
          </div>

          {/* Contest Rating */}
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Rating</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {leetcodeData.contestRating || 0}
            </div>
          </div>

          {/* Streak */}
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Streak</div>
            <div className="text-lg font-bold text-orange-600">
              {leetcodeData.streak || 0}🔥
            </div>
          </div>
        </div>

        {/* Right side - Primary metric */}
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {getSortLabel(sortBy)}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {getSortValue(sortBy, leetcodeData)}
          </div>
        </div>
      </div>

      {/* Mobile view - additional stats */}
      <div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Rating</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {leetcodeData.contestRating || 0}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Streak</div>
            <div className="font-semibold text-orange-600">
              {leetcodeData.streak || 0}🔥
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {leetcodeData.totalSolved || 0}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LeaderboardCard;
