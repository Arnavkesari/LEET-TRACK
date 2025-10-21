import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPlus, FaUser, FaSpinner, FaExternalLinkAlt } from 'react-icons/fa';

const AddFriendModal = ({ isOpen, onClose, onAdd, loading }) => {
  const [leetcodeId, setLeetcodeId] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const validateLeetCodeId = (id) => {
    // Basic validation for LeetCode username
    const leetcodePattern = /^[a-zA-Z0-9_-]{3,20}$/;
    return leetcodePattern.test(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!leetcodeId.trim()) {
      setError('Please enter a LeetCode ID');
      return;
    }

    if (!validateLeetCodeId(leetcodeId.trim())) {
      setError('Invalid LeetCode ID format. Use 3-20 characters (letters, numbers, _, -)');
      return;
    }

    setError('');
    setIsValidating(true);

    try {
      await onAdd(leetcodeId.trim());
      setLeetcodeId('');
      onClose(); // Close modal on success
    } catch (err) {
      setError(err.message || 'Failed to add friend. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (e) => {
    setLeetcodeId(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Add New Friend</h2>
            <p className="text-gray-400 text-sm">Enter their LeetCode username to track their progress</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
          >
            <FaTimes />
          </motion.button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Field */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              LeetCode Username
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={leetcodeId}
                onChange={handleInputChange}
                placeholder="e.g., john_doe123"
                className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
                  error 
                    ? 'border-red-400 focus:ring-red-500/50' 
                    : 'border-white/20 focus:ring-purple-500/50 focus:border-transparent'
                }`}
                disabled={loading || isValidating}
                autoFocus
              />
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm mt-2"
              >
                {error}
              </motion.p>
            )}
          </div>

          {/* Helper Text */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <FaExternalLinkAlt className="text-blue-400 text-xs" />
              </div>
              <div>
                <h4 className="text-blue-300 font-medium text-sm mb-1">How to find LeetCode username:</h4>
                <p className="text-blue-200/70 text-xs leading-relaxed">
                  Visit any LeetCode profile URL. The username is the part after "/u/" 
                  (e.g., in "leetcode.com/u/john_doe123", the username is "john_doe123")
                </p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg font-medium transition-all duration-300"
              disabled={loading || isValidating}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || isValidating || !leetcodeId.trim()}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading || isValidating ? (
                <>
                  <FaSpinner className="animate-spin" />
                  {isValidating ? 'Validating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <FaPlus />
                  Add Friend
                </>
              )}
            </motion.button>
          </div>
        </form>

        {/* Loading State */}
        {(loading || isValidating) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 bg-white/5 rounded-lg p-4 border border-white/10"
          >
            <div className="flex items-center gap-3">
              <FaSpinner className="animate-spin text-orange-400" />
              <div>
                <p className="text-white font-medium text-sm">
                  {isValidating ? 'Validating LeetCode profile...' : 'Scraping profile data...'}
                </p>
                <p className="text-gray-400 text-xs">
                  This may take a few seconds
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AddFriendModal;
