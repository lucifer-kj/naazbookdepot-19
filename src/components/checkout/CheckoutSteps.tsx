
import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  icon: React.ComponentType<any>;
}

interface CheckoutStepsProps {
  steps: Step[];
  currentStep: number;
}

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = step.id < currentStep;
        const isCurrent = step.id === currentStep;
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  isCompleted
                    ? 'bg-naaz-green text-white'
                    : isCurrent
                    ? 'bg-naaz-gold text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? <Check size={20} /> : <Icon size={20} />}
              </div>
              <span
                className={`text-sm font-medium ${
                  isCompleted || isCurrent ? 'text-naaz-green' : 'text-gray-400'
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-20 h-0.5 mx-4 mt-6 ${
                  step.id < currentStep ? 'bg-naaz-green' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default CheckoutSteps;
