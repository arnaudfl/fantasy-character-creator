import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  color = 'currentColor'
}) => {
  const sizeMap = {
    small: '16px',
    medium: '24px',
    large: '32px'
  };

  return (
    <div className="loading-spinner-container">
      <svg
        className="loading-spinner"
        style={{ 
          width: sizeMap[size], 
          height: sizeMap[size] 
        }}
        viewBox="0 0 50 50"
      >
        <circle
          className="loading-spinner-circle"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke={color}
          strokeWidth="5"
        />
      </svg>
    </div>
  );
}; 