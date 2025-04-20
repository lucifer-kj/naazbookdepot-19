
import React from 'react';
import { useFormContext } from 'react-hook-form';

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
