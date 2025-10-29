import { useState, useCallback, useRef, useEffect } from 'react';

export type FeedbackType = 'success' | 'error' | 'warning' | 'info';

export interface FeedbackMessage {
  id: string;
  type: FeedbackType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
  timestamp: number;
}

export interface FeedbackOptions {
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useUserFeedback = () => {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const generateId = () => `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addMessage = useCallback((
    type: FeedbackType,
    message: string,
    title?: string,
    options: FeedbackOptions = {}
  ) => {
    const id = generateId();
    const duration = options.duration ?? (type === 'error' ? 5000 : 3000);
    
    const feedbackMessage: FeedbackMessage = {
      id,
      type,
      title,
      message,
      duration,
      action: options.action,
      persistent: options.persistent || false,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, feedbackMessage]);

    // Auto-remove message after duration (unless persistent)
    if (!options.persistent && duration > 0) {
      const timeout = setTimeout(() => {
        removeMessage(id);
      }, duration);
      
      timeoutsRef.current.set(id, timeout);
    }

    return id;
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
    
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const clearAll = useCallback(() => {
    setMessages([]);
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message: string, title?: string, options?: FeedbackOptions) => {
    return addMessage('success', message, title, options);
  }, [addMessage]);

  const showError = useCallback((message: string, title?: string, options?: FeedbackOptions) => {
    return addMessage('error', message, title, options);
  }, [addMessage]);

  const showWarning = useCallback((message: string, title?: string, options?: FeedbackOptions) => {
    return addMessage('warning', message, title, options);
  }, [addMessage]);

  const showInfo = useCallback((message: string, title?: string, options?: FeedbackOptions) => {
    return addMessage('info', message, title, options);
  }, [addMessage]);

  // Operation feedback helpers
  const showOperationFeedback = useCallback((
    operation: string,
    success: boolean,
    customMessage?: string
  ) => {
    if (success) {
      showSuccess(customMessage || `${operation} completed successfully`);
    } else {
      showError(customMessage || `${operation} failed. Please try again.`);
    }
  }, [showSuccess, showError]);

  const showLoadingFeedback = useCallback((message: string = 'Loading...') => {
    return showInfo(message, undefined, { persistent: true });
  }, [showInfo]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return {
    messages,
    addMessage,
    removeMessage,
    clearAll,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showOperationFeedback,
    showLoadingFeedback
  };
};

// Hook for form validation feedback
export const useFormFeedback = () => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formMessage, setFormMessage] = useState<{
    type: FeedbackType;
    message: string;
  } | null>(null);

  const setFieldError = useCallback((field: string, error: string) => {
    setFieldErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllFieldErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const setFormSuccess = useCallback((message: string) => {
    setFormMessage({ type: 'success', message });
    setFieldErrors({});
  }, []);

  const setFormError = useCallback((message: string) => {
    setFormMessage({ type: 'error', message });
  }, []);

  const clearFormMessage = useCallback(() => {
    setFormMessage(null);
  }, []);

  const hasErrors = Object.keys(fieldErrors).length > 0;

  return {
    fieldErrors,
    formMessage,
    hasErrors,
    setFieldError,
    clearFieldError,
    clearAllFieldErrors,
    setFormSuccess,
    setFormError,
    clearFormMessage
  };
};

// Hook for operation status tracking
export const useOperationStatus = () => {
  const [operations, setOperations] = useState<Record<string, {
    status: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
    timestamp: number;
  }>>({});

  const setOperationStatus = useCallback((
    operationId: string,
    status: 'idle' | 'loading' | 'success' | 'error',
    message?: string
  ) => {
    setOperations(prev => ({
      ...prev,
      [operationId]: {
        status,
        message,
        timestamp: Date.now()
      }
    }));
  }, []);

  const startOperation = useCallback((operationId: string, message?: string) => {
    setOperationStatus(operationId, 'loading', message);
  }, [setOperationStatus]);

  const completeOperation = useCallback((operationId: string, message?: string) => {
    setOperationStatus(operationId, 'success', message);
  }, [setOperationStatus]);

  const failOperation = useCallback((operationId: string, message?: string) => {
    setOperationStatus(operationId, 'error', message);
  }, [setOperationStatus]);

  const resetOperation = useCallback((operationId: string) => {
    setOperationStatus(operationId, 'idle');
  }, [setOperationStatus]);

  const getOperationStatus = useCallback((operationId: string) => {
    return operations[operationId] || { status: 'idle' as const, timestamp: 0 };
  }, [operations]);

  const isOperationLoading = useCallback((operationId: string) => {
    return operations[operationId]?.status === 'loading';
  }, [operations]);

  return {
    operations,
    setOperationStatus,
    startOperation,
    completeOperation,
    failOperation,
    resetOperation,
    getOperationStatus,
    isOperationLoading
  };
};