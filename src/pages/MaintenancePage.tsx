import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Wrench, 
  Clock, 
  Mail, 
  RefreshCw, 
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react';

interface MaintenancePageProps {
  estimatedDuration?: string;
  reason?: string;
  contactEmail?: string;
  allowNotifications?: boolean;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({
  estimatedDuration = '2 hours',
  reason = 'We are performing scheduled maintenance to improve our services.',
  contactEmail = 'support@naazbooks.com',
  allowNotifications = true
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    // Simulate countdown timer
    const interval = setInterval(() => {
      const now = new Date();
      const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
      const diff = endTime.getTime() - now.getTime();
      
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else {
        setTimeRemaining('Completing soon...');
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleNotificationSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // In real implementation, save email for notifications
      setSubscribed(true);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <Wrench className="w-10 h-10 text-blue-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            We'll Be Right Back!
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-6 max-w-lg mx-auto">
            {reason}
          </p>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-800">Estimated Duration</span>
              </div>
              <div className="text-2xl font-bold text-yellow-900">{estimatedDuration}</div>
              {timeRemaining && (
                <div className="text-sm text-yellow-700 mt-1">
                  Approximately {timeRemaining} remaining
                </div>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">What's Being Updated</span>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <div>• Performance improvements</div>
                <div>• Security updates</div>
                <div>• New features</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Maintenance Progress</span>
              <span>75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
            </div>
          </div>

          {/* Notification Signup */}
          {allowNotifications && !subscribed && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Get Notified When We're Back</h3>
              <p className="text-gray-600 text-sm mb-4">
                We'll send you an email as soon as the site is back online.
              </p>
              <form onSubmit={handleNotificationSignup} className="flex max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 mr-2"
                  required
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Notify Me
                </Button>
              </form>
            </div>
          )}

          {/* Success Message */}
          {subscribed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center text-green-800">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">Thanks! We'll notify you when we're back online.</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
            
            <a 
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </a>
          </div>

          {/* Social Media Links */}
          <div className="border-t pt-6">
            <p className="text-gray-600 text-sm mb-4">
              Stay updated on our social media channels:
            </p>
            <div className="flex justify-center space-x-4">
              <a 
                href="#" 
                className="text-blue-600 hover:text-blue-700 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-blue-400 hover:text-blue-500 transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="text-pink-600 hover:text-pink-700 transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.596-3.205-1.529L12.017 8.696l6.773 6.763c-.757.933-1.908 1.529-3.205 1.529H8.449z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-600 text-sm">
          <p>© 2024 Naaz Books. We appreciate your patience during this maintenance.</p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
