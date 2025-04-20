
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './button';
import { logError } from '@/lib/services/error-service';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log the error
    logError({
      type: 'react_error_boundary',
      error: {
        message: error.message,
        stack: error.stack,
      },
      componentStack: errorInfo.componentStack,
    });
    
    // Call the error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4 text-center max-w-md">
            We encountered an error while rendering this part of the page.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Button onClick={this.handleReset} className="flex items-center">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link to="/" className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Link>
            </Button>
          </div>
          
          {error && (
            <div className="w-full">
              <details className="bg-gray-100 rounded-lg p-4 text-sm">
                <summary className="font-medium cursor-pointer">Error Details</summary>
                <div className="mt-2">
                  <p className="font-mono text-red-600 mb-2">{error.toString()}</p>
                  {errorInfo && (
                    <pre className="bg-gray-800 text-gray-200 p-3 rounded overflow-auto text-xs mt-2 max-h-48">
                      {errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            </div>
          )}
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
