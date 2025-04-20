import React from 'react';
import { useFormContext, ValidationMode } from 'react-hook-form';
import { AlertTriangle, Check, AlertCircle, HelpCircle } from 'lucide-react';

export type ValidationResult = 'valid' | 'invalid' | 'pending' | 'untouched';

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

export interface FormValidationSummaryProps {
  showValid?: boolean;
  formId?: string;
}

export const FormValidationSummary: React.FC<FormValidationSummaryProps> = ({
  showValid = false,
  formId,
}) => {
  const { formState } = useFormContext();
  const { errors, isSubmitted, isValid, isDirty } = formState;
  
  const errorCount = Object.keys(errors).length;
  
  if (errorCount === 0 || !isSubmitted) {
    return showValid && isSubmitted && isValid ? (
      <div className="bg-green-50 text-green-800 p-3 rounded-md mb-4 flex items-center">
        <Check className="h-5 w-5 mr-2" />
        <span>All fields are valid</span>
      </div>
    ) : null;
  }
  
  return (
    <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">
      <div className="flex items-center font-medium mb-2">
        <AlertTriangle className="h-5 w-5 mr-2" />
        <span>There {errorCount === 1 ? 'is 1 error' : `are ${errorCount} errors`} in this form</span>
      </div>
      
      <ul className="list-disc pl-10 space-y-1">
        {Object.entries(errors).map(([fieldName, error]) => (
          <li key={fieldName}>
            <a
              href={`#${formId ? `${formId}-` : ''}${fieldName}`}
              className="underline hover:text-red-900"
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(`${formId ? `${formId}-` : ''}${fieldName}`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  element.focus();
                }
              }}
            >
              {error.message as string || `${fieldName} is invalid`}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const getStrength = (): { score: number; feedback: string } => {
    if (!password) return { score: 0, feedback: 'Not provided' };
    
    let score = 0;
    
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    
    let feedback = '';
    if (score === 0) feedback = 'Very weak';
    else if (score === 1) feedback = 'Weak';
    else if (score === 2) feedback = 'Fair';
    else if (score === 3) feedback = 'Good';
    else if (score === 4) feedback = 'Strong';
    else if (score === 5) feedback = 'Very strong';
    
    return { score, feedback };
  };
  
  const { score, feedback } = getStrength();
  
  const getColor = () => {
    if (score <= 1) return 'bg-red-500';
    if (score === 2) return 'bg-orange-500';
    if (score === 3) return 'bg-yellow-500';
    if (score === 4) return 'bg-green-400';
    return 'bg-green-600';
  };
  
  return (
    <div className="space-y-1 mt-1">
      <div className="flex h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-full w-1/5 ${i < score ? getColor() : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-600 flex items-center">
        <HelpCircle className="h-3 w-3 mr-1" />
        Password strength: <span className="font-medium ml-1">{feedback}</span>
      </p>
    </div>
  );
};

export interface FormResetButtonProps {
  onClick?: () => void;
  className?: string;
}

export const FormResetButton: React.FC<FormResetButtonProps> = ({
  onClick,
  className,
}) => {
  const { reset, formState } = useFormContext();
  const { isDirty, isSubmitted } = formState;
  
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the form? All unsaved changes will be lost.')) {
      reset();
      if (onClick) onClick();
    }
  };
  
  if (!isDirty && !isSubmitted) return null;
  
  return (
    <button
      type="button"
      onClick={handleReset}
      className={`text-sm text-gray-500 hover:text-gray-700 ${className}`}
    >
      Reset form
    </button>
  );
};
