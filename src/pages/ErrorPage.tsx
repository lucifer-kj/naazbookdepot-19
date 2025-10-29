import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  ArrowLeft, 
  Wifi, 
  Server, 
  Shield, 
  Clock,
  Mail
} from 'lucide-react';

interface ErrorPageProps {
  errorType?: 'network' | 'server' | 'forbidden' | 'timeout' | 'chunk' | 'generic';
  errorCode?: string;
  errorMessage?: string;
  errorId?: string | null;
  showRetry?: boolean;
  onRetry?: () => void;
  onReload?: () => void;
  retryCount?: number;
  maxRetries?: number;
}

const ErrorPage: React.FC<ErrorPageProps> = ({
  errorType = 'generic',
  errorCode = '500',
  errorMessage = 'Something went wrong',
  errorId = null,
  showRetry = true,
  onRetry,
  onReload,
  retryCount = 0,
  maxRetries = 3
}) => {
  const navigate = useNavigate();

  const getErrorConfig = () => {
    switch (errorType) {
      case 'network':
        return {
          icon: Wifi,
          title: 'Connection Problem',
          description: 'Unable to connect to our servers. Please check your internet connection and try again.',
          code: 'NETWORK_ERROR',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      case 'server':
        return {
          icon: Server,
          title: 'Server Error',
          description: 'Our servers are experiencing some issues. Our team has been notified and is working on a fix.',
          code: '500',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'forbidden':
        return {
          icon: Shield,
          title: 'Access Denied',
          description: 'You don\'t have permission to access this resource. Please contact support if you believe this is an error.',
          code: '403',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
      case 'timeout':
        return {
          icon: Clock,
          title: 'Request Timeout',
          description: 'The request took too long to complete. This might be due to high server load or network issues.',
          code: '408',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'chunk':
        return {
          icon: RefreshCw,
          title: 'Loading Error',
          description: 'Failed to load application resources. This usually resolves with a page refresh.',
          code: 'CHUNK_ERROR',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      default:
        return {
          icon: AlertTriangle,
          title: 'Something Went Wrong',
          description: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
          code: errorCode,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getErrorConfig();
  const IconComponent = config.icon;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleReload = () => {
    if (onReload) {
      onReload();
    } else {
      window.location.reload();
    }
  };

  const getRetryButtonText = () => {
    if (errorType === 'chunk') return 'Reload Page';
    if (retryCount > 0) return `Try Again (${retryCount}/${maxRetries})`;
    return 'Try Again';
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center">
          {/* Error Icon and Code */}
          <div className="mb-8">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${config.bgColor} ${config.borderColor} border-2 mb-6`}>
              <IconComponent className={`w-12 h-12 ${config.color}`} />
            </div>
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
                Error {config.code}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {config.title}
            </h1>
            <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto">
              {errorMessage || config.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {showRetry && (
                <Button 
                  onClick={errorType === 'chunk' ? handleReload : handleRetry}
                  className="flex items-center bg-naaz-green hover:bg-green-600"
                  disabled={retryCount >= maxRetries && errorType !== 'chunk'}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {getRetryButtonText()}
                </Button>
              )}
              
              {errorType === 'chunk' && (
                <Button 
                  onClick={handleReload}
                  variant="outline"
                  className="flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
              )}
              
              <Button 
                onClick={() => navigate(-1)}
                variant="outline" 
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              
              <Link to="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Home className="w-4 h-4 mr-2" />
                  Homepage
                </Button>
              </Link>
            </div>
          </div>

          {/* Error Details (for development) */}
          {import.meta.env.DEV && (
            <div className="bg-gray-100 rounded-lg p-4 mb-8 text-left">
              <h3 className="font-medium text-gray-900 mb-2">Debug Information</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Error Type:</strong> {errorType}</div>
                <div><strong>Error Code:</strong> {errorCode}</div>
                <div><strong>Error ID:</strong> {errorId || 'N/A'}</div>
                <div><strong>Retry Count:</strong> {retryCount}/{maxRetries}</div>
                <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
                <div><strong>User Agent:</strong> {navigator.userAgent}</div>
                <div><strong>URL:</strong> {window.location.href}</div>
                <div><strong>Online:</strong> {navigator.onLine ? 'Yes' : 'No'}</div>
                {(navigator as any).connection && (
                  <div><strong>Connection:</strong> {(navigator as any).connection.effectiveType}</div>
                )}
              </div>
            </div>
          )}

          {/* Error ID for support (production) */}
          {!import.meta.env.DEV && errorId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <h4 className="font-medium text-gray-900 mb-2">Error Reference</h4>
              <p className="text-sm text-gray-600 mb-2">
                Please provide this error ID when contacting support:
              </p>
              <code className="bg-white px-3 py-1 rounded border text-sm font-mono text-gray-800">
                {errorId}
              </code>
            </div>
          )}

          {/* Helpful Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link
              to="/products"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-naaz-green hover:bg-green-50 transition-colors"
            >
              <div className="text-left">
                <div className="font-medium text-gray-900">Browse Books</div>
                <div className="text-sm text-gray-600">Explore our collection</div>
              </div>
            </Link>
            
            <Link
              to="/contact"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-naaz-green hover:bg-green-50 transition-colors"
            >
              <div className="text-left">
                <div className="font-medium text-gray-900">Contact Support</div>
                <div className="text-sm text-gray-600">Get help from our team</div>
              </div>
            </Link>
            
            <Link
              to="/faq"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-naaz-green hover:bg-green-50 transition-colors"
            >
              <div className="text-left">
                <div className="font-medium text-gray-900">FAQ</div>
                <div className="text-sm text-gray-600">Find quick answers</div>
              </div>
            </Link>
          </div>

          {/* Contact Information */}
          <div className={`${config.bgColor} rounded-lg p-6 ${config.borderColor} border`}>
            <h4 className={`font-medium ${config.color} mb-2`}>Need Immediate Help?</h4>
            <p className="text-gray-700 mb-4">
              If this error persists, please contact our support team with the error code above.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/contact">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </Button>
              </Link>
              <a 
                href="tel:+919876543210" 
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                Call: +91 98765 43210
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ErrorPage;