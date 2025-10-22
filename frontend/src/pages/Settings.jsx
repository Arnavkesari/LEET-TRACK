import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiCheck, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';

const Settings = () => {
  const { user, setUser } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-8"
        >
          Account Settings
        </motion.h1>

        {/* Content */}
        <div className="space-y-6">
          <AccountTab user={user} setUser={setUser} />
        </div>
      </main>

      <div className="opacity-100">
        <Footer />
      </div>
    </div>
  );
};

// Account Tab Component
const AccountTab = ({ user, setUser }) => {
  return (
    <div className="space-y-6">
      <ChangeNameSection user={user} setUser={setUser} />
      <ChangePasswordSection />
    </div>
  );
};

// Change Name Section
const ChangeNameSection = ({ user, setUser }) => {
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (fullName.trim() === user?.fullName) {
      setError('New name is the same as current name');
      return;
    }

    if (fullName.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    try {
      setLoading(true);
      const response = await userAPI.updateName(fullName.trim());
      setUser(response); // Update context
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating name:', err);
      setError(err.message || 'Failed to update name');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6"
    >
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <FiUser className="text-blue-400" />
        Change Display Name
      </h3>

      <form onSubmit={handleUpdateName} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
            placeholder="Enter your name"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            This is how your name will appear across the platform
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400"
          >
            <FiCheck className="flex-shrink-0" />
            <span className="text-sm">Name updated successfully!</span>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400"
          >
            <FiX className="flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading || fullName.trim() === user?.fullName}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Updating...' : 'Update Name'}
        </button>
      </form>
    </motion.div>
  );
};

// Change Password Section
const ChangePasswordSection = () => {
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak password';
    if (passwordStrength <= 3) return 'Medium password';
    return 'Strong password';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      await userAPI.changePassword(passwordData);
      setSuccess(true);
      
      // Clear form
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordStrength(0);
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6"
    >
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <FiLock className="text-blue-400" />
        Change Password
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.old ? 'text' : 'password'}
              value={passwordData.oldPassword}
              onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all pr-12"
              placeholder="Enter current password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPasswords(prev => ({ ...prev, old: !prev.old }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPasswords.old ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all pr-12"
              placeholder="Enter new password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPasswords.new ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {/* Password Strength Indicator */}
          {passwordData.newPassword && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map(level => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded ${
                      level <= passwordStrength ? getStrengthColor() : 'bg-gray-700'
                    } transition-all duration-300`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400">
                {getStrengthText()}
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all pr-12"
              placeholder="Confirm new password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {/* Match Indicator */}
          {passwordData.confirmPassword && (
            <p className={`text-xs mt-1 ${
              passwordData.newPassword === passwordData.confirmPassword
                ? 'text-green-400'
                : 'text-red-400'
            }`}>
              {passwordData.newPassword === passwordData.confirmPassword
                ? '✓ Passwords match'
                : '✗ Passwords do not match'}
            </p>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400"
          >
            <FiCheck className="flex-shrink-0" />
            <span className="text-sm">Password changed successfully!</span>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400"
          >
            <FiX className="flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Changing Password...' : 'Change Password'}
        </button>
      </form>
    </motion.div>
  );
};

export default Settings;
