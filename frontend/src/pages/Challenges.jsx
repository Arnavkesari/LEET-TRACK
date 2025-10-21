import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAward, FiUsers, FiClock, FiTrendingUp, FiPlus, FiTarget } from 'react-icons/fi';
import { challengesAPI } from '../services/api';
import ChallengeCard from '../components/ChallengeCard';
import CreateChallengeModal from '../components/CreateChallengeModal';
import ErrorMessage from '../components/ErrorMessage';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Challenges = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [challenges, setChallenges] = useState([]);
  const [pendingChallenges, setPendingChallenges] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    won: 0,
    active: 0,
    winRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [activeChallenges, pending, challengeHistory, challengeStats] = await Promise.all([
        challengesAPI.getActiveChallenges().catch(err => { console.error('Active challenges error:', err); return []; }),
        challengesAPI.getPendingChallenges().catch(err => { console.error('Pending challenges error:', err); return []; }),
        challengesAPI.getChallengeHistory(20).catch(err => { console.error('History error:', err); return []; }),
        challengesAPI.getChallengeStats().catch(err => { console.error('Stats error:', err); return { total: 0, won: 0, active: 0, winRate: 0 }; })
      ]);

      setChallenges(Array.isArray(activeChallenges) ? activeChallenges : []);
      setPendingChallenges(Array.isArray(pending) ? pending : []);
      setHistory(Array.isArray(challengeHistory) ? challengeHistory : []);
      setStats(challengeStats || { total: 0, won: 0, active: 0, winRate: 0 });
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setError(err.message || 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptChallenge = async (challengeId) => {
    try {
      await challengesAPI.acceptChallenge(challengeId);
      await fetchData(); // Refresh all data
    } catch (err) {
      console.error('Error accepting challenge:', err);
      setError(err.message || 'Failed to accept challenge');
    }
  };

  const handleDeclineChallenge = async (challengeId) => {
    try {
      await challengesAPI.declineChallenge(challengeId);
      await fetchData();
    } catch (err) {
      console.error('Error declining challenge:', err);
      setError(err.message || 'Failed to decline challenge');
    }
  };

  const handleCancelChallenge = async (challengeId) => {
    try {
      await challengesAPI.cancelChallenge(challengeId);
      await fetchData();
    } catch (err) {
      console.error('Error cancelling challenge:', err);
      setError(err.message || 'Failed to cancel challenge');
    }
  };

  const handleCreateChallenge = async () => {
    await fetchData();
    setShowCreateModal(false);
  };

  const getDisplayData = () => {
    switch (activeTab) {
      case 'active':
        return challenges;
      case 'pending':
        return pendingChallenges;
      case 'history':
        return history;
      default:
        return [];
    }
  };

  const tabs = [
    { id: 'active', label: 'Active', count: challenges.length },
    { id: 'pending', label: 'Pending', count: pendingChallenges.length },
    { id: 'history', label: 'History', count: history.length }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Challenges</h1>
              <p className="text-gray-400">Compete with your friends and track your progress</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              <FiPlus className="w-5 h-5" />
              New Challenge
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <FiAward className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Challenges</p>
                <p className="text-2xl font-bold text-white">{stats.total || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <FiTarget className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Won</p>
                <p className="text-2xl font-bold text-white">{stats.won || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <FiClock className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Active</p>
                <p className="text-2xl font-bold text-white">{stats.active || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Win Rate</p>
                <p className="text-2xl font-bold text-white">{stats.winRate || 0}%</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={() => { setError(''); fetchData(); }} />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-gray-800/50 backdrop-blur-sm rounded-xl p-2 border border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Challenges List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : getDisplayData().length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700">
              <FiAward className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No {activeTab} challenges
              </h3>
              <p className="text-gray-400 mb-6">
                {activeTab === 'active' && "Start a new challenge to compete with your friends!"}
                {activeTab === 'pending' && "You don't have any pending challenges."}
                {activeTab === 'history' && "Your challenge history will appear here."}
              </p>
              {activeTab === 'active' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Create Challenge
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {getDisplayData().map((challenge, index) => (
              <motion.div
                key={challenge._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ChallengeCard
                  challenge={challenge}
                  onAccept={handleAcceptChallenge}
                  onDecline={handleDeclineChallenge}
                  onCancel={handleCancelChallenge}
                  showActions={activeTab === 'pending'}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Challenge Modal */}
        {showCreateModal && (
          <CreateChallengeModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateChallenge}
          />
        )}
      </div>
      </div>
      <Footer />
    </>
  );
};

export default Challenges;
