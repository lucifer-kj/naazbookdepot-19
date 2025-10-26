import { useState, useCallback, useRef } from 'react';

interface RateLimitOptions {
  maxAttempts?: number;
  timeWindow?: number; // in milliseconds
  blockDuration?: number; // in milliseconds
}

export function useRateLimit({
  maxAttempts = 5,
  timeWindow = 60000, // 1 minute
  blockDuration = 300000, // 5 minutes
}: RateLimitOptions = {}) {
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const attemptsTimestamps = useRef<number[]>([]);
  const blockTimeout = useRef<NodeJS.Timeout>();

  const resetAttempts = useCallback(() => {
    setAttempts(0);
    attemptsTimestamps.current = [];
  }, []);

  const checkRateLimit = useCallback(() => {
    if (isBlocked) {
      return false;
    }

    const now = Date.now();
    const windowStart = now - timeWindow;

    // Remove old attempts
    attemptsTimestamps.current = attemptsTimestamps.current.filter(
      (timestamp) => timestamp > windowStart
    );

    // Add new attempt
    attemptsTimestamps.current.push(now);
    setAttempts(attemptsTimestamps.current.length);

    // Check if rate limit is exceeded
    if (attemptsTimestamps.current.length > maxAttempts) {
      setIsBlocked(true);
      blockTimeout.current = setTimeout(() => {
        setIsBlocked(false);
        resetAttempts();
      }, blockDuration);
      return false;
    }

    return true;
  }, [isBlocked, maxAttempts, timeWindow, blockDuration, resetAttempts]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (blockTimeout.current) {
      clearTimeout(blockTimeout.current);
    }
    resetAttempts();
    setIsBlocked(false);
  }, [resetAttempts]);

  return {
    isRateLimited: isBlocked,
    attempts,
    checkRateLimit,
    resetRateLimit: cleanup,
  };
}