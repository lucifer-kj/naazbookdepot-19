
import React from 'react';
import { HelpCircle } from 'lucide-react';

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
