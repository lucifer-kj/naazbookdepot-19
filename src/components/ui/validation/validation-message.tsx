
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AlertTriangle, Check, AlertCircle } from 'lucide-react';

// Update the ValidationResult type to include 'pending'
export type ValidationResult = 'valid' | 'invalid' | 'untouched' | 'pending';

export interface ValidationMessageProps {
  name: string;
  validMessage?: string;
  rules?: {
    required?: boolean | string;
    minLength?: number | { value: number; message: string };
    maxLength?: number | { value: number; message: string };
    pattern?: RegExp | { value: RegExp; message: string };
    validate?: (value: any) => true | string;
  };
  showValid?: boolean;
  className?: string;
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({
  name,
  validMessage = 'Looks good!',
  rules,
  showValid = true,
  className,
}) => {
  const { formState, getValues } = useFormContext();
  const { errors, touchedFields, dirtyFields, isSubmitted } = formState;
  
  const isInteracted = touchedFields[name] || dirtyFields[name] || isSubmitted;
  
  const value = getValues(name);
  const hasValue = value !== undefined && value !== null && value !== '';
  
  let status: ValidationResult = 'untouched';
  
  if (isInteracted && hasValue) {
    if (errors[name]) {
      status = 'invalid';
    } else if (rules) {
      status = 'valid';
    }
  } else if (isInteracted && rules?.required && !hasValue) {
    status = 'invalid';
  } else if (isSubmitted) {
    status = errors[name] ? 'invalid' : 'valid';
  }
  
  // Add a condition to set status to 'pending' if needed
  // This is just an example - adjust based on your specific requirements
  if (/* your pending condition here */) {
    status = 'pending';
  }
  
  if (status === 'untouched' && !isSubmitted) {
    return null;
  }
  
  if (status === 'valid' && !showValid) {
    return null;
  }
  
  return (
    <div className={`text-sm mt-1 ${className}`}>
      {status === 'valid' && (
        <div className="flex items-center text-green-600">
          <Check className="h-4 w-4 mr-1" />
          <span>{validMessage}</span>
        </div>
      )}
      
      {status === 'invalid' && (
        <div className="flex items-center text-red-600">
          <AlertTriangle className="h-4 w-4 mr-1" />
          <span>{errors[name]?.message as string || 'This field is invalid'}</span>
        </div>
      )}
      
      {status === 'pending' && (
        <div className="flex items-center text-blue-600">
          <AlertCircle className="h-4 w-4 mr-1 animate-pulse" />
          <span>Validating...</span>
        </div>
      )}
    </div>
  );
};
