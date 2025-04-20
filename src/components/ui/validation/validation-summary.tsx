
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AlertTriangle, Check } from 'lucide-react';

export interface FormValidationSummaryProps {
  showValid?: boolean;
  formId?: string;
}

export const FormValidationSummary: React.FC<FormValidationSummaryProps> = ({
  showValid = false,
  formId,
}) => {
  const { formState } = useFormContext();
  const { errors, isSubmitted, isValid } = formState;
  
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
