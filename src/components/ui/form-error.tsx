
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormErrorProps {
  title?: string;
  error?: string | string[] | null;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({
  title = 'Error',
  error,
  className,
}) => {
  if (!error) return null;

  const errorMessages = Array.isArray(error) ? error : [error];

  return (
    <Alert variant="destructive" className={cn("mb-4", className)}>
      <XCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {errorMessages.length === 1 ? (
          <p>{errorMessages[0]}</p>
        ) : (
          <ul className="list-disc pl-5 mt-2">
            {errorMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
};

interface FormSuccessProps {
  title?: string;
  message?: string | null;
  className?: string;
}

export const FormSuccess: React.FC<FormSuccessProps> = ({
  title = 'Success',
  message,
  className,
}) => {
  if (!message) return null;

  return (
    <Alert className={cn("mb-4 bg-emerald-500/15", className)}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
