
import React, { useState } from 'react';
import { X } from 'lucide-react';
// Removed unused icons like Eye, EyeOff, Mail, Lock, User, Phone from here
// Button is used inside LoginForm and RegistrationForm
// useAuth is used inside LoginForm and RegistrationForm
// toast is used inside LoginForm and RegistrationForm
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);

  // All other states (formData, errors, isLoading, showPassword) and
  // handler functions (handleInputChange, validateForm, handleSubmit, getPasswordStrength)
  // have been moved to LoginForm.tsx and RegistrationForm.tsx.

  if (!isOpen) return null;

  const handleSwitchToRegister = () => {
    setIsLogin(false);
    // Errors would be local to the form, so no need to clear them here globally
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
    // Errors would be local to the form
  };

  // The `onSuccess` prop for LoginForm and RegistrationForm will call `onClose` here.
  // If RegistrationForm needs to stay open for email confirmation message,
  // it can manage that internally by not calling its `onSuccess` prop immediately.
  // Or, a more complex state/callback could be passed from here if LoginModal
  // needs to be aware of the "awaiting confirmation" state. For this refactor,
  // we assume RegistrationForm handles the message display, and calls onSuccess (i.e. onClose)
  // only if it should actually close. If it shows a message, it won't call onSuccess.

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-playfair font-bold text-naaz-green">
              {isLogin ? 'Welcome Back' : 'Join Our Community'}
            </h2>
            <p className="text-sm text-gray-600 mt-1 font-arabic">
              {isLogin ? 'السلام عليكم ورحمة الله وبركاته' : 'أهلاً وسهلاً بكم'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Conditionally render Login or Registration Form */}
        {isLogin ? (
          <LoginForm
            onSuccess={onClose}
            onSwitchToRegister={handleSwitchToRegister}
          />
        ) : (
          <RegistrationForm
            onSuccess={onClose}
            onSwitchToLogin={handleSwitchToLogin}
          />
        )}
      </div>
    </div>
  );
};

export default LoginModal;
