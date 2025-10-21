import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiBarChart2, FiTarget, FiCalendar } from 'react-icons/fi';

const ProgressChart = ({ data }) => {
  const [timeRange, setTimeRange] = useState('6months');
  const [chartType, setChartType] = useState('cumulative');

  const timeRanges = [
    { value: '1month', label: '1M' },
    { value: '3months', label: '3M' },
    { value: '6months', label: '6M' },
    { value: '1year', label: '1Y' }
  ];

  const chartTypes = [
    { value: 'cumulative', label: 'Cumulative', icon: FiTrendingUp },
    { value: 'monthly', label: 'Monthly', icon: FiBarChart2 }
  ];

  // Calculate max value for scaling
  const maxValue = Math.max(
    ...data.easy,
    ...data.medium,
    ...data.hard
  );

  const getBarHeight = (value) => {
    return (value / maxValue) * 200; // 200px max height
  };

  const totalProblems = {
    easy: data.easy[data.easy.length - 1],
    medium: data.medium[data.medium.length - 1],
    hard: data.hard[data.hard.length - 1]
  };

  const totalSolved = totalProblems.easy + totalProblems.medium + totalProblems.hard;

  // Calculate monthly growth
  const monthlyGrowth = data.labels.map((label, index) => {
    if (index === 0) return 0;
    const prevTotal = data.easy[index - 1] + data.medium[index - 1] + data.hard[index - 1];
    const currentTotal = data.easy[index] + data.medium[index] + data.hard[index];
    return currentTotal - prevTotal;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Progress Over Time
          </h3>
          
          <div className="mt-3 sm:mt-0 flex gap-2">
            {/* Chart Type Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {chartTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setChartType(type.value)}
                  className={`flex items-center px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    chartType === type.value
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <type.icon className="h-4 w-4 mr-1" />
                  {type.label}
                </button>
              ))}
            </div>

            {/* Time Range Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {timeRanges.map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    timeRange === range.value
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{totalProblems.easy}</div>
            <div className="text-sm text-green-700 dark:text-green-400">Easy Problems</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{totalProblems.medium}</div>
            <div className="text-sm text-yellow-700 dark:text-yellow-400">Medium Problems</div>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{totalProblems.hard}</div>
            <div className="text-sm text-red-700 dark:text-red-400">Hard Problems</div>
          </div>
        </div>

        {/* Chart */}
        <div className="relative">
          <div className="flex items-end justify-between h-64 mb-4">
            {data.labels.map((label, index) => (
              <div key={label} className="flex flex-col items-center flex-1">
                {chartType === 'cumulative' ? (
                  <div className="flex flex-col items-center justify-end h-52 mb-2">
                    {/* Stacked bars for cumulative */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: getBarHeight(data.hard[index]) }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="w-8 bg-red-500 rounded-t-sm"
                      title={`Hard: ${data.hard[index]}`}
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: getBarHeight(data.medium[index]) }}
                      transition={{ delay: index * 0.1 + 0.1, duration: 0.5 }}
                      className="w-8 bg-yellow-500"
                      title={`Medium: ${data.medium[index]}`}
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: getBarHeight(data.easy[index]) }}
                      transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                      className="w-8 bg-green-500 rounded-b-sm"
                      title={`Easy: ${data.easy[index]}`}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-end h-52 mb-2">
                    {/* Single bar for monthly growth */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: getBarHeight(monthlyGrowth[index] || 0) }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="w-8 bg-blue-500 rounded-sm"
                      title={`Growth: ${monthlyGrowth[index] || 0}`}
                    />
                  </div>
                )}
                <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-center space-x-6 text-sm">
            {chartType === 'cumulative' ? (
              <>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                  <span className="text-gray-600 dark:text-gray-400">Easy</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
                  <span className="text-gray-600 dark:text-gray-400">Medium</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                  <span className="text-gray-600 dark:text-gray-400">Hard</span>
                </div>
              </>
            ) : (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span className="text-gray-600 dark:text-gray-400">Monthly Growth</span>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <FiTarget className="h-5 w-5 text-blue-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {totalSolved}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Solved</div>
          </div>
          <div className="text-center">
            <FiTrendingUp className="h-5 w-5 text-green-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {monthlyGrowth[monthlyGrowth.length - 1] || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">This Month</div>
          </div>
          <div className="text-center">
            <FiBarChart2 className="h-5 w-5 text-purple-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {Math.round(monthlyGrowth.reduce((sum, val) => sum + val, 0) / monthlyGrowth.length)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg/Month</div>
          </div>
          <div className="text-center">
            <FiCalendar className="h-5 w-5 text-orange-600 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {data.labels.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Months Active</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;
