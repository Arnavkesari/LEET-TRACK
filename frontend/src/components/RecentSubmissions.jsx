import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiClock, FiCode, FiExternalLink } from 'react-icons/fi';

const RecentSubmissions = ({ submissions }) => {
  const [filter, setFilter] = useState('all');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted':
        return <FiCheck className="h-4 w-4 text-green-600" />;
      case 'Wrong Answer':
        return <FiX className="h-4 w-4 text-red-600" />;
      case 'Time Limit Exceeded':
        return <FiClock className="h-4 w-4 text-yellow-600" />;
      default:
        return <FiClock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'Wrong Answer':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'Time Limit Exceeded':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-700';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'hard':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
    }
  };

  const getLanguageColor = (language) => {
    const colors = {
      'Python3': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'Java': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      'C++': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'JavaScript': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'Go': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400'
    };
    return colors[language] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (filter === 'all') return true;
    return submission.status.toLowerCase().includes(filter.toLowerCase());
  });

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'wrong', label: 'Wrong Answer' },
    { value: 'time', label: 'Time Limit' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Submissions
          </h3>
          
          {/* Filter Tabs */}
          <div className="mt-3 sm:mt-0">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {filters.map((filterOption) => (
                <button
                  key={filterOption.value}
                  onClick={() => setFilter(filterOption.value)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    filter === filterOption.value
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {filteredSubmissions.length > 0 ? (
          filteredSubmissions.map((submission, index) => (
            <motion.div
              key={submission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(submission.status)}
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {submission.problem}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(submission.difficulty)}`}>
                      {submission.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                    </div>
                    
                    {submission.runtime !== '-' && (
                      <div className="flex items-center">
                        <FiClock className="h-4 w-4 mr-1" />
                        <span>Runtime: {submission.runtime}</span>
                      </div>
                    )}
                    
                    {submission.memory !== '-' && (
                      <div className="flex items-center">
                        <span>Memory: {submission.memory}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <FiCode className="h-4 w-4 mr-1" />
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getLanguageColor(submission.language)}`}>
                        {submission.language}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4 flex flex-col items-end">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {submission.timestamp}
                  </span>
                  <button className="mt-2 inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                    <FiExternalLink className="h-4 w-4 mr-1" />
                    <span className="text-sm">View</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <FiCode className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No submissions found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filter === 'all' 
                ? 'No submissions to display.' 
                : `No submissions matching "${filter}" filter.`}
            </p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredSubmissions.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {submissions.filter(s => s.status === 'Accepted').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Accepted</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {submissions.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {Math.round((submissions.filter(s => s.status === 'Accepted').length / submissions.length) * 100)}%
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentSubmissions;
