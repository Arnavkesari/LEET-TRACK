import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaTwitter, FaLinkedin, FaHeart, FaCode } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl font-bold text-white mb-3">
                LeetCode <span className="text-orange-400">Friends Tracker</span>
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Track your coding progress, compete with friends, and grow together. 
                Built for developers who love to solve problems and share their journey.
              </p>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span>Made with</span>
                <FaHeart className="text-red-400 text-xs" />
                <span>for the coding community</span>
              </div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="/leaderboard" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Leaderboard
                  </a>
                </li>
                <li>
                  <a href="/challenges" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Challenges
                  </a>
                </li>
                <li>
                  <a href="/profile" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Profile
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Support */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/help" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Contact Us
                  </a>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="border-t border-white/20 mt-8 pt-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <FaCode className="text-orange-400" />
              <span>© {currentYear} LeetCode Friends Tracker. All rights reserved.</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all duration-300"
              >
                <FaGithub className="text-sm" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all duration-300"
              >
                <FaTwitter className="text-sm" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 transition-all duration-300"
              >
                <FaLinkedin className="text-sm" />
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
