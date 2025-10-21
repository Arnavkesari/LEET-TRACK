import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaSignOutAlt, FaBell, FaCog, FaCode } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import leetcodeLogo from '../assets/leetcode_logo.png';

const Header = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    // Call logout from AuthContext (which clears storage and state)
    await logout();
    
    // Redirect to landing page
    window.location.href = '/';
  };

  return (
    <header className="bg-gray-900/95 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 p-0.5">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <img 
                  src={leetcodeLogo} 
                  alt="LeetCode Logo" 
                  className="w-6 h-6 object-contain"
                />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                LeetCode <span className="text-orange-400">Friends</span>
              </h1>
              <p className="text-xs text-gray-400">Track • Compete • Grow</p>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <motion.a
              whileHover={{ scale: 1.05 }}
              href="/dashboard"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Dashboard
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              href="/leaderboard"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Leaderboard
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              href="/challenges"
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Challenges
            </motion.a>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative p-2 text-gray-400 hover:text-white transition-colors"
            >
              <FaBell className="text-lg" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </motion.button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 bg-white/10 rounded-lg px-3 py-2 border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Avatar" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-white text-sm" />
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-white font-medium text-sm">{user?.username || 'User'}</p>
                  <p className="text-gray-400 text-xs">@{user?.leetcodeId || 'username'}</p>
                </div>
              </motion.button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 shadow-xl z-50"
                >
                  <div className="py-2">
                    <a
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <FaUser className="text-sm" />
                      Profile
                    </a>
                    <div className="border-t border-white/20 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-white/10 transition-colors w-full text-left"
                    >
                      <FaSignOutAlt className="text-sm" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
