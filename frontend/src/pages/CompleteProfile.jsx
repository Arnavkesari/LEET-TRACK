import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCode, FaUserCircle, FaCheckCircle } from 'react-icons/fa';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import leetcodeLogo from '../assets/leetcode_logo.png';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [leetcodeId, setLeetcodeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!leetcodeId.trim()) {
      setError('Please enter your LeetCode username');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.setLeetCodeId(leetcodeId.trim());
      
      // Update user context with new leetcodeId
      if (setUser && response.user) {
        setUser(response.user);
      }

      setSuccess(true);

      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (err) {
      console.error('Error setting LeetCode ID:', err);
      setError(err.message || 'Failed to set LeetCode username. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-8">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 p-1">
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                  <img 
                    src={leetcodeLogo} 
                    alt="LeetCode Logo" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              One More Step!
            </h1>
            <p className="text-gray-400">
              Add your LeetCode username to unlock all features
            </p>
          </div>

          {/* User Info */}
          <div className="bg-white/5 rounded-lg p-4 mb-6 flex items-center gap-3">
            <FaUserCircle className="text-3xl text-blue-400" />
            <div>
              <p className="text-white font-medium">{user?.fullName || 'User'}</p>
              <p className="text-gray-400 text-sm">{user?.email || ''}</p>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6 flex items-center gap-3"
            >
              <FaCheckCircle className="text-green-400 text-xl" />
              <div>
                <p className="text-green-400 font-medium">Profile Completed!</p>
                <p className="text-green-300 text-sm">Redirecting to dashboard...</p>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-6"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* LeetCode Username Input */}
            <div>
              <label className="block text-gray-300 font-medium mb-2">
                LeetCode Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCode className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={leetcodeId}
                  onChange={(e) => setLeetcodeId(e.target.value)}
                  placeholder="Enter your LeetCode username"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all"
                  disabled={loading || success}
                />
              </div>
              <p className="text-gray-500 text-xs mt-2">
                This will be used to track your progress and compare with friends
              </p>
            </div>

            {/* Benefits List */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-300 font-medium mb-2 text-sm">You'll be able to:</p>
              <ul className="space-y-1 text-gray-300 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">✓</span> Track your LeetCode progress
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">✓</span> Compare stats with friends
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">✓</span> View recent submissions
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-400">✓</span> Participate in challenges
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || success}
                className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold py-3 rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : success ? 'Completed!' : 'Continue'}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleSkip}
                disabled={loading || success}
                className="px-6 py-3 bg-white/5 border border-white/20 text-gray-300 font-semibold rounded-lg hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Skip
              </motion.button>
            </div>
          </form>

          {/* Skip Note */}
          <p className="text-gray-500 text-xs text-center mt-4">
            You can always add this later from your profile settings
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CompleteProfile;
