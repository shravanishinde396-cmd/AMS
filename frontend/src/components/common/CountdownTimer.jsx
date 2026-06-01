import { useState, useEffect } from 'react';

const CountdownTimer = ({ expiresAt, onExpire, size = 'md' }) => {
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const total = new Date(expiresAt) - Date.now();

      if (total <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0, total: 0 });
        if (onExpire) onExpire();
        return false;
      }

      const minutes = Math.floor((total / 1000 / 60) % 60);
      const seconds = Math.floor((total / 1000) % 60);
      setTimeLeft({ minutes, seconds, total });
      return true;
    };

    // Initial calculation
    const stillActive = calculateTime();
    if (!stillActive) return;

    const interval = setInterval(() => {
      const active = calculateTime();
      if (!active) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const isExpired = timeLeft.total <= 0;
  const isUrgent = timeLeft.total > 0 && timeLeft.total < 60000; // less than 1 min

  const sizeClasses = {
    sm: 'countdown-sm',
    md: 'countdown-md',
    lg: 'countdown-lg',
  };

  return (
    <div className={`countdown ${sizeClasses[size]} ${isExpired ? 'countdown-expired' : ''} ${isUrgent ? 'countdown-urgent' : ''}`}>
      {isExpired ? (
        <span className="countdown-text">Session Closed</span>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="countdown-text">
            {String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </>
      )}
    </div>
  );
};

export default CountdownTimer;
