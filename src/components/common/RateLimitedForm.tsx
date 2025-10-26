import React, { FormEvent } from 'react';
import { useRateLimit } from '../../lib/hooks/useRateLimit';
import { toast } from 'sonner';

interface RateLimitedFormProps {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
  children: React.ReactNode;
  maxAttempts?: number;
  timeWindow?: number;
  blockDuration?: number;
  className?: string;
}

export const RateLimitedForm: React.FC<RateLimitedFormProps> = ({
  onSubmit,
  children,
  maxAttempts = Number(import.meta.env.VITE_RATE_LIMIT_MAX_ATTEMPTS) || 5,
  timeWindow = Number(import.meta.env.VITE_RATE_LIMIT_WINDOW) || 60000,
  blockDuration = Number(import.meta.env.VITE_RATE_LIMIT_BLOCK_DURATION) || 300000,
  className = '',
}) => {
  const { isRateLimited, checkRateLimit, attempts } = useRateLimit({
    maxAttempts,
    timeWindow,
    blockDuration,
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isRateLimited) {
      toast.error('Too many attempts. Please try again later.');
      return;
    }

    if (!checkRateLimit()) {
      toast.error(`Rate limit exceeded. Please wait ${Math.ceil(blockDuration / 60000)} minutes.`);
      return;
    }

    try {
      await onSubmit(e);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      {children}
      {attempts > 0 && attempts < maxAttempts && (
        <div className="text-sm text-gray-500 mt-2">
          {maxAttempts - attempts} attempts remaining
        </div>
      )}
    </form>
  );
};