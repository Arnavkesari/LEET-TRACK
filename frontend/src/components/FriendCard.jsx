import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, 
  FaTrophy, 
  FaFire, 
  FaChartLine, 
  FaTrash, 
  FaExternalLinkAlt,
  FaCircle,
  FaClock
} from 'react-icons/fa';

const FriendCard = ({ friend, onRemove }) => {
  const navigate = useNavigate();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Extract data from backend structure
  const totalSolved = friend?.leetcodeData?.totalSolved || 0;
  const easySolved = friend?.leetcodeData?.easySolved || 0;
  const mediumSolved = friend?.leetcodeData?.mediumSolved || 0;
  const hardSolved = friend?.leetcodeData?.hardSolved || 0;
  const ranking = friend?.leetcodeData?.ranking || 0;
  const streak = friend?.leetcodeData?.streak || 0;
  const contestRating = friend?.leetcodeData?.contestRating || 0;

  const handleRemove = () => {
    if (onRemove) {
      onRemove(friend.leetcodeId);
    }
    setShowConfirmDelete(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStreakColor = (streak) => {
    if (streak >= 30) return 'text-orange-400';
    if (streak >= 14) return 'text-yellow-400';
    if (streak >= 7) return 'text-green-400';
    return 'text-gray-400';
  };

  const formatLastActive = (date) => {
    if (!date) return 'Unknown';
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => navigate(`/friend/${friend.leetcodeId}`)}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 relative overflow-hidden group cursor-pointer"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              {friend.avatar ? (
                <img 
                  src={friend.avatar} 
                  alt={friend.name} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FaUser className="text-white text-lg" />
              )}
            </div>
            {/* Online Status */}
            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-slate-800 flex items-center justify-center ${
              friend.isOnline ? 'bg-green-500' : 'bg-gray-500'
            }`}>
              <FaCircle className="text-xs" />
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">{friend.name}</h3>
            <div className="flex items-center gap-2">
              <p className="text-gray-400 text-sm">@{friend.leetcodeId}</p>
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                href={`https://leetcode.com/u/${friend.leetcodeId}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-orange-300 transition-colors"
              >
              <FaExternalLinkAlt className="text-xs" />
                </motion.a>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirmDelete(true);
            }}
            className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-lg flex items-center justify-center text-red-400 hover:text-red-300 transition-all duration-300"
          >
            <FaTrash className="text-xs" />
          </motion.button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4 relative z-10">
        {/* Total Solved */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <FaTrophy className="text-orange-400 text-sm" />
            <span className="text-gray-400 text-xs">Total Solved</span>
          </div>
          <p className="text-white font-bold text-xl">{totalSolved}</p>
        </div>

        {/* Rank */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <FaChartLine className="text-purple-400 text-sm" />
            <span className="text-gray-400 text-xs">Rank</span>
          </div>
          <p className="text-white font-bold text-xl">
            {ranking > 0 ? `#${ranking.toLocaleString()}` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Problem Breakdown */}
      <div className="mb-4 relative z-10">
        <h4 className="text-gray-300 text-sm font-medium mb-2">Problem Breakdown</h4>
        <div className="flex gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-green-400 font-semibold text-sm">{easySolved}</span>
            <span className="text-gray-500 text-xs">Easy</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-yellow-400 font-semibold text-sm">{mediumSolved}</span>
            <span className="text-gray-500 text-xs">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-red-400 font-semibold text-sm">{hardSolved}</span>
            <span className="text-gray-500 text-xs">Hard</span>
          </div>
        </div>
      </div>

      {/* Streak & Last Active */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <FaFire className={`text-sm ${getStreakColor(streak)}`} />
          <span className="text-gray-400 text-xs">Streak:</span>
          <span className={`font-semibold text-sm ${getStreakColor(streak)}`}>
            {streak} days
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-500 text-xs">
          <FaClock className="text-xs" />
          <span>{formatLastActive(friend.lastActive)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 relative z-10">
        <div className="w-full bg-white/10 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((totalSolved / 1000) * 100, 100)}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full"
          />
        </div>
        <p className="text-gray-400 text-xs mt-1">
          Progress: {totalSolved}/1000 problems
        </p>
      </div>      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-20"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20 text-center max-w-xs"
            >
              <h4 className="text-white font-semibold mb-2">Remove Friend?</h4>
              <p className="text-gray-400 text-sm mb-4">
                Are you sure you want to remove {friend.name} from your friends list?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="flex-1 px-3 py-2 bg-white/10 text-gray-300 rounded-lg text-sm hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemove}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FriendCard;
