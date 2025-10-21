import React from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="p-3 bg-red-500/10 rounded-full">
        <FiAlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-white">Something went wrong</h3>
        <p className="text-slate-400 text-sm max-w-md">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <FiRefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
