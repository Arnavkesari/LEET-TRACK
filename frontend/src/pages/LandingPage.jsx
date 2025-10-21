import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGoogle, FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaCode } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import leetcodeLogo from '../assets/leetcode_logo.png';

const LandingPage = () => {
  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const fullText = "Track your LeetCode progress and compete with friends in real-time. Stay motivated, solve more problems, and level up together!";

  // Typing animation effect
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, fullText]);

  // Handle OAuth callback from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const message = urlParams.get('message');

    if (authStatus === 'success') {
      // OAuth successful, the backend should have set cookies
      navigate('/dashboard');
    } else if (authStatus === 'error') {
      alert(`Authentication failed: ${message || 'Unknown error'}`);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    leetcodeId: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading) return; // Prevent multiple submissions
    
    // Basic validation
    if (!formData.username.trim() || !formData.password.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      if (isLogin) {
        // Login with username/email and password
        const loginData = {
          password: formData.password
        };
        
        // Add email or username based on input format
        if (formData.username.includes('@')) {
          loginData.email = formData.username;
        } else {
          loginData.username = formData.username;
        }
        
        const result = await login(loginData);
        
        if (result.success) {
          console.log('Login successful');
          // Navigate using React Router
          navigate('/dashboard');
        } else {
          alert(result.error || 'Login failed');
        }
      } else {
        // Registration validation
        if (!formData.email.trim() || !formData.username.trim() || 
            !formData.password.trim() || !formData.confirmPassword.trim()) {
          alert('Please fill in all required fields');
          setLoading(false);
          return;
        }
        
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match');
          setLoading(false);
          return;
        }
        
        if (formData.password.length < 6) {
          alert('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }
        
        const result = await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          fullName: formData.username, // Using username as fullName for now
          leetcodeId: formData.leetcodeId
        });
        
        if (result.success) {
          alert('Registration successful! Please log in.');
          setIsLogin(true);
          resetForm();
        } else {
          alert(result.error || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      // Get Google Auth URL from backend
      const response = await fetch('/api/v1/auth/google/url', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success && data.data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.data.authUrl;
      } else {
        alert('Failed to get Google auth URL');
        setLoading(false);
      }
    } catch (error) {
      console.error('Google auth error:', error);
      alert('Failed to initiate Google authentication');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      leetcodeId: ''
    });
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col lg:flex-row">
      {/* Left Section - Hero Content */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12"
      >
        <div className="text-center max-w-lg">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6, type: "spring", stiffness: 200 }}
            className="mb-6 lg:mb-8 flex justify-center"
          >
            <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 p-1 shadow-2xl">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                <img 
                  src={leetcodeLogo} 
                  alt="LeetCode Logo" 
                  className="w-16 h-16 lg:w-20 lg:h-20 object-contain"
                />
              </div>
            </div>
          </motion.div>

          {/* App Title */}
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight"
          >
            LeetCode
            <span className="bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
              {" "}Friends
            </span>
            <br />
            Tracker
          </motion.h1>

          {/* Typing Animation Text */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="text-gray-300 text-base lg:text-lg leading-relaxed mb-6 lg:mb-8 h-16 lg:h-24"
          >
            <span>{typedText}</span>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="inline-block w-0.5 h-6 bg-orange-400 ml-1"
            />
          </motion.div>


          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 1 }}
            className="absolute top-20 left-20 w-20 h-20 bg-purple-500/20 rounded-full blur-xl hidden lg:block"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-32 left-32 w-16 h-16 bg-orange-400/20 rounded-full blur-lg hidden lg:block"
          />
        </div>
      </motion.div>

      {/* Right Section - Auth Panel */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12"
      >
        <div className="w-full max-w-md">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 lg:p-8 shadow-2xl border border-white/20"
          >
            {/* Header */}
            <div className="text-center mb-6 lg:mb-8">
              <motion.h1 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-2xl lg:text-3xl font-bold text-white mb-2"
              >
                {isLogin ? 'Welcome Back!' : 'Join Us Today!'}
              </motion.h1>
              <p className="text-gray-300 text-sm lg:text-base">
                {isLogin ? 'Sign in to track your progress' : 'Create your account to get started'}
              </p>
            </div>

            {/* Auth Toggle */}
            <div className="flex bg-white/5 rounded-lg p-1 mb-4 lg:mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                  isLogin 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
                  !isLogin 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Google OAuth Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-3 bg-white text-gray-700 py-2.5 lg:py-3 px-4 rounded-lg font-medium mb-4 lg:mb-6 hover:bg-gray-50 transition-colors duration-300 shadow-lg text-sm lg:text-base ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FaGoogle className="text-red-500" />
              {loading ? 'Please wait...' : 'Continue with Google'}
            </motion.button>

            <div className="flex items-center my-4 lg:my-6">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="px-4 text-gray-400 text-xs lg:text-sm">or</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.form
                key={isLogin ? 'login' : 'signup'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* Username */}
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 lg:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm lg:text-base"
                    required
                  />
                </div>

                {/* Email (Sign Up only) */}
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                  >
                    <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 lg:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm lg:text-base"
                      required
                    />
                  </motion.div>
                )}

                {/* Password */}
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-2.5 lg:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm lg:text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Confirm Password (Sign Up only) */}
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                  >
                    <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-2.5 lg:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm lg:text-base"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </motion.div>
                )}

                {/* LeetCode ID (Sign Up only) */}
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                  >
                    <FaCode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="leetcodeId"
                      placeholder="LeetCode Username"
                      value={formData.leetcodeId}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 lg:py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm lg:text-base"
                      required
                    />
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2.5 lg:py-3 px-4 rounded-lg font-semibold shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:shadow-xl text-sm lg:text-base ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                </motion.button>
              </motion.form>
            </AnimatePresence>

            {/* Footer */}
            <div className="mt-4 lg:mt-6 text-center">
              <p className="text-gray-400 text-xs lg:text-sm">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={toggleAuthMode}
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
