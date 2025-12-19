import { useState, useEffect } from 'react';

// Enhanced Interactive Spinner Component
interface EnhancedSpinnerProps {
  size?: number;
  color?: string;
  message?: string;
  subMessage?: string;
  showProgress?: boolean;
  progress?: number;
}

export const EnhancedSpinner = ({
  size = 60,
  color = '#ff6600',
  message = 'Generating...',
  subMessage,
  showProgress = false,
  progress = 0
}: EnhancedSpinnerProps) => {
  const [currentMessage, setCurrentMessage] = useState(message);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const messages = [
      'Analyzing requirements...',
      'Connecting to AI...',
      'Generating code...',
      'Finalizing components...'
    ];
    let messageIndex = 0;

    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setCurrentMessage(messages[messageIndex]);
    }, 2000);

    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Main spinner with animated rings */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
          style={{
            borderTopColor: color,
            borderRightColor: `${color}40`,
            animation: 'spin 1.5s linear infinite'
          }}
        />

        {/* Middle ring */}
        <div
          className="absolute inset-2 rounded-full border-4 border-transparent animate-spin"
          style={{
            borderTopColor: color,
            borderBottomColor: `${color}60`,
            animation: 'spin 1s linear infinite reverse'
          }}
        />

        {/* Inner ring */}
        <div
          className="absolute inset-4 rounded-full border-4 border-transparent animate-pulse"
          style={{
            borderLeftColor: color,
            borderRightColor: `${color}80`
          }}
        />

        {/* Center dot */}
        <div
          className="absolute inset-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse"
          style={{
            width: size * 0.15,
            height: size * 0.15,
            backgroundColor: color
          }}
        />
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 ease-out rounded-full"
            style={{
              width: `${progress}%`,
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}40`
            }}
          />
        </div>
      )}

      {/* Messages */}
      <div className="text-center">
        <div className="text-lg font-semibold text-gray-800 mb-1">
          {currentMessage}{dots}
        </div>
        {subMessage && (
          <div className="text-sm text-gray-500">
            {subMessage}
          </div>
        )}
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full opacity-60 animate-ping"
            style={{
              backgroundColor: color,
              left: '50%',
              top: '50%',
              animationDelay: `${i * 0.2}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Simple spinner for secondary use
interface SpinnerProps {
  size?: number;
  color?: string;
}

export const Spinner = ({ size = 20, color = '#ff6600' }: SpinnerProps) => {
  return (
    <div
      className="rounded-full border-2 border-transparent animate-spin"
      style={{
        width: size,
        height: size,
        borderTopColor: color,
        borderRightColor: `${color}40`
      }}
    />
  );
};
