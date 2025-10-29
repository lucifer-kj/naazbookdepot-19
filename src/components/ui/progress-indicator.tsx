import React from 'react';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressStep {
  id: string;
  label: string;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep?: string;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  showDescriptions?: boolean;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  className,
  orientation = 'horizontal',
  showLabels = true,
  showDescriptions = false
}) => {
  const getStepIcon = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'active':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'error':
        return <Circle className="h-5 w-5 text-red-600 fill-current" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepClasses = (step: ProgressStep, index: number) => {
    const baseClasses = "flex items-center";
    
    if (orientation === 'vertical') {
      return cn(baseClasses, "mb-4 last:mb-0");
    }
    
    return cn(
      baseClasses,
      index < steps.length - 1 && "flex-1",
      "relative"
    );
  };

  const getConnectorClasses = (step: ProgressStep, index: number) => {
    if (index === steps.length - 1) return "hidden";
    
    const isCompleted = step.status === 'completed';
    
    if (orientation === 'vertical') {
      return cn(
        "absolute left-2.5 top-8 w-0.5 h-8 -ml-px",
        isCompleted ? "bg-green-600" : "bg-gray-300"
      );
    }
    
    return cn(
      "flex-1 h-0.5 mx-4",
      isCompleted ? "bg-green-600" : "bg-gray-300"
    );
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn("space-y-0", className)}>
        {steps.map((step, index) => (
          <div key={step.id} className="relative">
            <div className={getStepClasses(step, index)}>
              <div className="flex-shrink-0 relative z-10">
                {getStepIcon(step)}
              </div>
              {showLabels && (
                <div className="ml-3">
                  <div className={cn(
                    "text-sm font-medium",
                    step.status === 'completed' ? "text-green-600" :
                    step.status === 'active' ? "text-blue-600" :
                    step.status === 'error' ? "text-red-600" :
                    "text-gray-500"
                  )}>
                    {step.label}
                  </div>
                  {showDescriptions && step.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {step.description}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className={getConnectorClasses(step, index)} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center w-full", className)}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className={getStepClasses(step, index)}>
            <div className="flex flex-col items-center">
              {getStepIcon(step)}
              {showLabels && (
                <div className="mt-2 text-center">
                  <div className={cn(
                    "text-xs font-medium",
                    step.status === 'completed' ? "text-green-600" :
                    step.status === 'active' ? "text-blue-600" :
                    step.status === 'error' ? "text-red-600" :
                    "text-gray-500"
                  )}>
                    {step.label}
                  </div>
                  {showDescriptions && step.description && (
                    <div className="text-xs text-gray-400 mt-1">
                      {step.description}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={getConnectorClasses(step, index)} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Circular Progress Component
interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
  color?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  size = 40,
  strokeWidth = 4,
  className,
  showPercentage = false,
  color = "text-blue-600"
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-300 ease-in-out", color)}
        />
      </svg>
      {showPercentage && (
        <span className="absolute text-xs font-medium">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
};

// Linear Progress Component
interface LinearProgressProps {
  progress: number; // 0-100
  className?: string;
  height?: string;
  color?: string;
  backgroundColor?: string;
  animated?: boolean;
}

const LinearProgress: React.FC<LinearProgressProps> = ({
  progress,
  className,
  height = "h-2",
  color = "bg-blue-600",
  backgroundColor = "bg-gray-200",
  animated = false
}) => {
  return (
    <div className={cn("w-full rounded-full overflow-hidden", backgroundColor, height, className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300 ease-out",
          color,
          animated && "animate-pulse"
        )}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
};

// Loading Dots Component
interface LoadingDotsProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const LoadingDots: React.FC<LoadingDotsProps> = ({
  className,
  size = 'md',
  color = "bg-blue-600"
}) => {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  const dotSize = sizeClasses[size];

  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={cn(
            "rounded-full animate-bounce",
            dotSize,
            color
          )}
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}
    </div>
  );
};

export {
  ProgressIndicator,
  CircularProgress,
  LinearProgress,
  LoadingDots
};