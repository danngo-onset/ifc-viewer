import type React from "react";

interface LoadingSpinnerProps {
  isVisible: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  isVisible, 
  message = "Loading model..." 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-6 py-4 flex items-center space-x-3 shadow-lg border">
        <span className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></span>
        
        <p className="text-sm font-medium text-gray-700">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
