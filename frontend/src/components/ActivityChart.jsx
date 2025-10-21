import React from 'react';
import { motion } from 'framer-motion';

const ActivityChart = ({ data }) => {
  // Generate a grid for the last 52 weeks (365 days)
  const generateActivityGrid = () => {
    const weeks = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364); // Go back 364 days to get 52 weeks

    for (let week = 0; week < 52; week++) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (week * 7) + day);
        
        // Mock activity data - in real app, this would come from props
        const activityCount = Math.floor(Math.random() * 6); // 0-5 submissions per day
        
        weekData.push({
          date: currentDate.toISOString().split('T')[0],
          count: activityCount,
          dateObj: new Date(currentDate)
        });
      }
      weeks.push(weekData);
    }
    
    return weeks;
  };

  const activityGrid = generateActivityGrid();

  const getIntensityClass = (count) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count <= 2) return 'bg-green-200 dark:bg-green-900/40';
    if (count <= 4) return 'bg-green-400 dark:bg-green-700/60';
    return 'bg-green-600 dark:bg-green-600';
  };

  const getIntensityLabel = (count) => {
    if (count === 0) return 'No activity';
    if (count <= 2) return 'Low activity';
    if (count <= 4) return 'Medium activity';
    return 'High activity';
  };

  const totalSubmissions = activityGrid.flat().reduce((sum, day) => sum + day.count, 0);
  const currentStreak = 15; // Mock data
  const longestStreak = 32; // Mock data

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Activity Chart
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {totalSubmissions} submissions in the last year
        </p>
      </div>
      <div className="p-6">
        {/* Activity Grid */}
        <div className="mb-6">
          <div className="flex gap-1 overflow-x-auto pb-2">
            {activityGrid.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <motion.div
                    key={`${weekIndex}-${dayIndex}`}
                    whileHover={{ scale: 1.2 }}
                    className={`w-3 h-3 rounded-sm cursor-pointer ${getIntensityClass(day.count)}`}
                    title={`${day.count} submissions on ${day.dateObj.toLocaleDateString()}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (weekIndex * 7 + dayIndex) * 0.001 }}
                  />
                ))}
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
              <span className="mr-2">Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
                <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900/40"></div>
                <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700/60"></div>
                <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-600"></div>
              </div>
              <span className="ml-2">More</span>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalSubmissions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Submissions
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {currentStreak}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Current Streak
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {longestStreak}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Longest Streak
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityChart;
