import React from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiClock, FiTarget, FiCheckCircle, FiXCircle, FiCalendar, FiTrendingUp } from 'react-icons/fi';

const ChallengeCard = ({ challenge, onAccept, onDecline, onCancel, showActions = false }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'speed':
        return <FiClock className="w-5 h-5" />;
      case 'difficulty':
        return <FiTrendingUp className="w-5 h-5" />;
      case 'streak':
        return <FiTarget className="w-5 h-5" />;
      case 'topic':
        return <FiTarget className="w-5 h-5" />;
      default:
        return <FiAward className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'speed':
        return 'from-blue-500 to-cyan-500';
      case 'difficulty':
        return 'from-red-500 to-orange-500';
      case 'streak':
        return 'from-green-500 to-emerald-500';
      case 'topic':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'Pending', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      active: { text: 'Active', class: 'bg-green-500/20 text-green-400 border-green-500/30' },
      completed: { text: 'Completed', class: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      cancelled: { text: 'Cancelled', class: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
      declined: { text: 'Declined', class: 'bg-red-500/20 text-red-400 border-red-500/30' }
    };
    
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  const getDaysRemaining = () => {
    if (!challenge.config.endDate) return null;
    const end = new Date(challenge.config.endDate);
    const now = new Date();
    const diff = end - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const getProgressPercentage = (solved, total) => {
    return Math.min(100, Math.round((solved / total) * 100));
  };

  const creatorProgress = getProgressPercentage(challenge.progress.creator.solved, challenge.config.problemCount);
  const opponentProgress = getProgressPercentage(challenge.progress.opponent.solved, challenge.config.problemCount);
  const daysRemaining = getDaysRemaining();

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 bg-gradient-to-br ${getTypeColor(challenge.type)} rounded-lg text-white`}>
            {getTypeIcon(challenge.type)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white capitalize">
              {challenge.type} Challenge
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(challenge.status)}
              {challenge.status === 'active' && daysRemaining !== null && (
                <span className="text-sm text-gray-400">
                  {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
                </span>
              )}
            </div>
          </div>
        </div>
        
        {challenge.winner && (
          <div className="flex items-center gap-2">
            <FiAward className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-medium">
              {challenge.winner === 'creator' ? challenge.creator.fullName : 
               challenge.winner === 'opponent' ? challenge.opponent.name : 'Tie'}
            </span>
          </div>
        )}
      </div>

      {/* Challenge Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-gray-400 text-sm">Problems</p>
          <p className="text-white font-semibold text-lg">{challenge.config.problemCount}</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-gray-400 text-sm">Duration</p>
          <p className="text-white font-semibold text-lg">{challenge.config.duration} days</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-gray-400 text-sm">Difficulty</p>
          <p className="text-white font-semibold text-lg capitalize">{challenge.config.difficulty}</p>
        </div>
        {challenge.config.topic && (
          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-gray-400 text-sm">Topic</p>
            <p className="text-white font-semibold text-lg">{challenge.config.topic}</p>
          </div>
        )}
      </div>

      {/* Participants Progress */}
      <div className="space-y-4 mb-6">
        {/* Creator */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {challenge.creator.avatar ? (
                <img
                  src={challenge.creator.avatar}
                  alt={challenge.creator.fullName}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {challenge.creator.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-white font-medium">{challenge.creator.fullName}</span>
            </div>
            <span className="text-gray-400 text-sm">
              {challenge.progress.creator.solved} / {challenge.config.problemCount}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${creatorProgress}%` }}
            />
          </div>
        </div>

        {/* Opponent */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {challenge.opponent.avatar ? (
                <img
                  src={challenge.opponent.avatar}
                  alt={challenge.opponent.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold text-sm">
                  {challenge.opponent.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-white font-medium">{challenge.opponent.name}</span>
            </div>
            <span className="text-gray-400 text-sm">
              {challenge.progress.opponent.solved} / {challenge.config.problemCount}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${opponentProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-3 pt-4 border-t border-gray-700">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAccept(challenge._id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <FiCheckCircle className="w-4 h-4" />
            Accept
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onDecline(challenge._id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <FiXCircle className="w-4 h-4" />
            Decline
          </motion.button>
        </div>
      )}

      {/* Created Date */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-700 text-gray-400 text-sm">
        <FiCalendar className="w-4 h-4" />
        Created {new Date(challenge.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })}
      </div>
    </motion.div>
  );
};

export default ChallengeCard;
