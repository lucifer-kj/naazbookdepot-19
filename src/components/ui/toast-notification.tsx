import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FeedbackMessage, FeedbackType } from '@/lib/hooks/useUserFeedback';

interface ToastNotificationProps {
  message: FeedbackMessage;
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  onClose,
  position = 'top-right'
}) => {
  const getIcon = (type: FeedbackType) => {
    const iconProps = { className: "h-5 w-5 flex-shrink-0" };
    
    switch (type) {
      case 'success':
        return <CheckCircle {...iconProps} className={cn(iconProps.className, "text-green-600")} />;
      case 'error':
        return <AlertCircle {...iconProps} className={cn(iconProps.className, "text-red-600")} />;
      case 'warning':
        return <AlertTriangle {...iconProps} className={cn(iconProps.className, "text-yellow-600")} />;
      case 'info':
        return <Info {...iconProps} className={cn(iconProps.className, "text-blue-600")} />;
      default:
        return <Info {...iconProps} className={cn(iconProps.className, "text-gray-600")} />;
    }
  };

  const getBackgroundColor = (type: FeedbackType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = (type: FeedbackType) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  const getAnimationDirection = () => {
    switch (position) {
      case 'top-right':
      case 'bottom-right':
        return { x: 300, opacity: 0 };
      case 'top-left':
      case 'bottom-left':
        return { x: -300, opacity: 0 };
      case 'top-center':
        return { y: -100, opacity: 0 };
      case 'bottom-center':
        return { y: 100, opacity: 0 };
      default:
        return { x: 300, opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getAnimationDirection()}
      animate={{ x: 0, y: 0, opacity: 1 }}
      exit={getAnimationDirection()}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "max-w-sm w-full shadow-lg rounded-lg border pointer-events-auto overflow-hidden",
        getBackgroundColor(message.type)
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon(message.type)}
          </div>
          <div className="ml-3 w-0 flex-1">
            {message.title && (
              <p className={cn("text-sm font-medium", getTextColor(message.type))}>
                {message.title}
              </p>
            )}
            <p className={cn(
              "text-sm",
              message.title ? "mt-1" : "",
              getTextColor(message.type)
            )}>
              {message.message}
            </p>
            {message.action && (
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={message.action.onClick}
                  className="text-xs"
                >
                  {message.action.label}
                </Button>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={cn(
                "rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2",
                getTextColor(message.type),
                "hover:opacity-75"
              )}
              onClick={() => onClose(message.id)}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress bar for timed notifications */}
      {!message.persistent && message.duration && message.duration > 0 && (
        <div className="h-1 bg-black bg-opacity-10">
          <motion.div
            className="h-full bg-current opacity-50"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: message.duration / 1000, ease: "linear" }}
          />
        </div>
      )}
    </motion.div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  messages: FeedbackMessage[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxMessages?: number;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  messages,
  onClose,
  position = 'top-right',
  maxMessages = 5
}) => {
  const getContainerClasses = () => {
    const baseClasses = "fixed z-50 pointer-events-none";
    
    switch (position) {
      case 'top-right':
        return cn(baseClasses, "top-4 right-4");
      case 'top-left':
        return cn(baseClasses, "top-4 left-4");
      case 'bottom-right':
        return cn(baseClasses, "bottom-4 right-4");
      case 'bottom-left':
        return cn(baseClasses, "bottom-4 left-4");
      case 'top-center':
        return cn(baseClasses, "top-4 left-1/2 transform -translate-x-1/2");
      case 'bottom-center':
        return cn(baseClasses, "bottom-4 left-1/2 transform -translate-x-1/2");
      default:
        return cn(baseClasses, "top-4 right-4");
    }
  };

  // Limit the number of visible messages
  const visibleMessages = messages.slice(-maxMessages);

  return (
    <div className={getContainerClasses()}>
      <div className="space-y-2">
        <AnimatePresence>
          {visibleMessages.map((message) => (
            <ToastNotification
              key={message.id}
              message={message}
              onClose={onClose}
              position={position}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Global Toast Provider Component
interface GlobalToastProviderProps {
  children: React.ReactNode;
  messages: FeedbackMessage[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const GlobalToastProvider: React.FC<GlobalToastProviderProps> = ({
  children,
  messages,
  onClose,
  position = 'top-right'
}) => {
  return (
    <>
      {children}
      <ToastContainer
        messages={messages}
        onClose={onClose}
        position={position}
      />
    </>
  );
};

export {
  ToastNotification,
  ToastContainer,
  GlobalToastProvider
};