import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

interface RateLimitNotificationProps {
  isRateLimited: boolean;
  retryAfter?: number | null;
  resetTime?: Date | null;
  remaining?: number;
  maxRequests?: number;
  action?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const RateLimitNotification: React.FC<RateLimitNotificationProps> = ({
  isRateLimited,
  retryAfter,
  resetTime,
  remaining = 0,
  maxRequests = 100,
  action = 'this action',
  onRetry,
  onDismiss,
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(retryAfter || 0);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (!isRateLimited || !retryAfter) {
      setTimeLeft(0);
      return;
    }

    setTimeLeft(retryAfter);
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = Math.max(0, prev - 1);
        if (newTime === 0 && onRetry) {
          // Auto-retry when time is up
          setTimeout(onRetry, 100);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRateLimited, retryAfter, onRetry]);

  useEffect(() => {
    if (maxRequests > 0) {
      setProgress((remaining / maxRequests) * 100);
    }
  }, [remaining, maxRequests]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes < 60) {
      return remainingSeconds > 0 
        ? `${minutes}m ${remainingSeconds}s`
        : `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours} hour${hours !== 1 ? 's' : ''}`;
  };

  const getAlertVariant = () => {
    if (isRateLimited) return 'destructive';
    if (remaining < maxRequests * 0.2) return 'default'; // Warning when < 20% remaining
    return 'default';
  };

  const getIcon = () => {
    if (isRateLimited) return <AlertTriangle className="h-4 w-4" />;
    if (remaining < maxRequests * 0.2) return <Clock className="h-4 w-4" />;
    return <Shield className="h-4 w-4" />;
  };

  const getTitle = () => {
    if (isRateLimited) return 'Rate Limit Exceeded';
    if (remaining < maxRequests * 0.2) return 'Rate Limit Warning';
    return 'Rate Limit Status';
  };

  const getDescription = () => {
    if (isRateLimited) {
      return `You've exceeded the rate limit for ${action}. Please wait ${formatTime(timeLeft)} before trying again.`;
    }
    
    if (remaining < maxRequests * 0.2) {
      return `You have ${remaining} requests remaining for ${action}. The limit will reset ${resetTime ? `at ${resetTime.toLocaleTimeString()}` : 'soon'}.`;
    }
    
    return `You have ${remaining} of ${maxRequests} requests remaining for ${action}.`;
  };

  // Don't show notification if not rate limited and plenty of requests remaining
  if (!isRateLimited && remaining > maxRequests * 0.8) {
    return null;
  }

  return (
    <Alert variant={getAlertVariant()} className={`${className} transition-all duration-300`}>
      {getIcon()}
      <AlertTitle className="flex items-center justify-between">
        {getTitle()}
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 hover:bg-transparent"
          >
            ×
          </Button>
        )}
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{getDescription()}</p>
        
        {/* Progress bar showing remaining requests */}
        {!isRateLimited && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Requests used</span>
              <span>{maxRequests - remaining} / {maxRequests}</span>
            </div>
            <Progress value={100 - progress} className="h-2" />
          </div>
        )}
        
        {/* Countdown timer when rate limited */}
        {isRateLimited && timeLeft > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>Time remaining: {formatTime(timeLeft)}</span>
            </div>
            <Progress 
              value={(timeLeft / (retryAfter || 1)) * 100} 
              className="h-2"
            />
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          {isRateLimited && timeLeft === 0 && onRetry && (
            <Button
              size="sm"
              onClick={onRetry}
              className="h-8"
            >
              Try Again
            </Button>
          )}
          
          {resetTime && (
            <div className="text-xs text-muted-foreground flex items-center">
              Resets at {resetTime.toLocaleTimeString()}
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};

/**
 * Hook to manage rate limit notification state
 */
export const useRateLimitNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [notificationData, setNotificationData] = useState<Partial<RateLimitNotificationProps>>({});

  const showNotification = (data: Partial<RateLimitNotificationProps>) => {
    setNotificationData(data);
    setIsVisible(true);
  };

  const hideNotification = () => {
    setIsVisible(false);
    setNotificationData({});
  };

  const updateNotification = (data: Partial<RateLimitNotificationProps>) => {
    setNotificationData(prev => ({ ...prev, ...data }));
  };

  return {
    isVisible,
    notificationData,
    showNotification,
    hideNotification,
    updateNotification
  };
};

export default RateLimitNotification;
