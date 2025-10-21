import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUsers, FiTarget, FiClock, FiTrendingUp, FiZap } from 'react-icons/fi';
import { friendsAPI, challengesAPI } from '../services/api';
import ErrorMessage from './ErrorMessage';

const CreateChallengeModal = ({ onClose, onCreate }) => {
  const [friends, setFriends] = useState([]);
  const [formData, setFormData] = useState({
    opponentId: '',
    type: 'mixed',
    problemCount: 10,
    duration: 7,
    difficulty: 'mixed',
    topic: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const data = await friendsAPI.getFriends();
      setFriends(data);
    } catch (err) {
      console.error('Error fetching friends:', err);
      setError('Failed to load friends');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.opponentId) {
      setError('Please select an opponent');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await challengesAPI.createChallenge(formData);
      onCreate();
    } catch (err) {
      console.error('Error creating challenge:', err);
      setError(err.message || 'Failed to create challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const challengeTypes = [
    { id: 'mixed', name: 'Mixed', icon: FiTarget, desc: 'Any problems', color: 'from-gray-500 to-gray-600' },
    { id: 'speed', name: 'Speed', icon: FiZap, desc: 'Solve fastest', color: 'from-blue-500 to-cyan-500' },
    { id: 'difficulty', name: 'Difficulty', icon: FiTrendingUp, desc: 'Hard problems', color: 'from-red-500 to-orange-500' },
    { id: 'streak', name: 'Streak', icon: FiTarget, desc: 'Daily consistency', color: 'from-green-500 to-emerald-500' },
    { id: 'topic', name: 'Topic', icon: FiTarget, desc: 'Specific topic', color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-white">Create Challenge</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && <ErrorMessage message={error} onClose={() => setError('')} />}

            {/* Select Opponent */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Select Opponent
              </label>
              <select
                value={formData.opponentId}
                onChange={(e) => handleChange('opponentId', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose a friend</option>
                {friends.map((friend) => (
                  <option key={friend._id} value={friend._id}>
                    {friend.name} (@{friend.leetcodeId})
                  </option>
                ))}
              </select>
            </div>

            {/* Challenge Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Challenge Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {challengeTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleChange('type', type.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.type === type.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                    }`}
                  >
                    <div className={`w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center text-white`}>
                      <type.icon className="w-5 h-5" />
                    </div>
                    <p className="text-white text-sm font-medium">{type.name}</p>
                    <p className="text-gray-400 text-xs mt-1">{type.desc}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Problem Count */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Number of Problems
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.problemCount}
                onChange={(e) => handleChange('problemCount', parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Duration (days)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={formData.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-4 gap-3">
                {['mixed', 'easy', 'medium', 'hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => handleChange('difficulty', diff)}
                    className={`py-2 px-4 rounded-lg capitalize font-medium transition-all ${
                      formData.difficulty === diff
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic (optional for topic challenges) */}
            {formData.type === 'topic' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Topic
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => handleChange('topic', e.target.value)}
                  placeholder="e.g., Arrays, Dynamic Programming"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Message (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Challenge Message (optional)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Add a friendly message or taunt..."
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Challenge'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateChallengeModal;
