import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';

const RecentActivity = ({ friends }) => {
  // Generate recent activity from friends data
  const recentActivity = friends.flatMap(friend => 
    friend.leetcodeData?.recentSubmissions?.map(submission => ({
      id: `${friend.leetcodeId}-${submission.titleSlug || submission.title}`,
      friendName: friend.name,
      friendAvatar: friend.avatar,
      problem: submission.title,
      difficulty: 'Medium', // LeetCode API doesn't provide difficulty in submissions
      status: submission.statusDisplay,
      time: submission.timestamp ? new Date(submission.timestamp).toLocaleString() : 'Recently'
    })) || []
  ).sort((a, b) => {
    const dateA = a.time === 'Recently' ? new Date() : new Date(a.time);
    const dateB = b.time === 'Recently' ? new Date() : new Date(b.time);
    return dateB - dateA;
  }).slice(0, 6);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'hard': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted': return <FiCheck className="h-4 w-4 text-green-600" />;
      case 'Wrong Answer': return <FiX className="h-4 w-4 text-red-600" />;
      default: return <FiClock className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
      </div>
      <div className="p-6">
        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3"
              >
                <img
                  src={activity.friendAvatar}
                  alt={activity.friendName}
                  className="h-8 w-8 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.friendName}
                    </p>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(activity.status)}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {activity.problem}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(activity.difficulty)}`}>
                      {activity.difficulty}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FiClock className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              No recent activity
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Activity will appear here when your friends solve problems
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
