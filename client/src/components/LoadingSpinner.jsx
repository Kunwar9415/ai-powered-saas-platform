import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Processing with AI...', size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 p-6 text-center ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 blur-md opacity-40 animate-pulse"></div>
        <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-indigo-400 animate-spin relative z-10`} />
      </div>
      {message && <p className="text-sm font-medium text-gray-300 animate-pulse">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
