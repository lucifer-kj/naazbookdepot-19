import { useState, useEffect } from 'react';
import { Mail, Settings, CheckCircle, AlertCircle, Bell, BookOpen, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/context/AuthContext';

interface EmailPreferences {
  order_updates: boolean;
  shipping_notifications: boolean;
  new_arrivals: boolean;
  special_offers: boolean;
  islamic_insights: boolean;
  newsletter: boolean;
}

interface EmailPreferencesProps {
  className?: string;
}

export const EmailPreferences = ({ className = '' }: EmailPreferencesProps) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<EmailPreferences>({
    order_updates: true,
    shipping_notifications: true,
    new_arrivals: true,
    special_offers: true,
    islamic_insights: true,
    newsletter: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user?.email) return;

    setIsLoading(true);
    try {
      // Try to get preferences from user profile first
      const { data: profile } = await supabase
        .from('profiles')
        .select('email_preferences')
        .eq('id', user.id)
        .single();

      if (profile?.email_preferences) {
        setPreferences({ ...preferences, ...profile.email_preferences });
      } else {
        // Check newsletter subscription
        const { data: newsletter } = await supabase
          .from('newsletter_subscribers')
          .select('preferences, is_active')
          .eq('email', user.email.toLowerCase())
          .single();

        if (newsletter) {
          setPreferences({
            ...preferences,
            newsletter: newsletter.is_active,
            ...newsletter.preferences
          });
        }
      }
    } catch (error) {
      console.error('Error loading email preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user?.email) return;

    setIsSaving(true);
    setStatus('idle');
    setMessage('');

    try {
      // Update user profile preferences
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          email_preferences: preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      // Update newsletter subscription if exists
      if (preferences.newsletter) {
        const { error: newsletterError } = await supabase
          .from('newsletter_subscribers')
          .upsert({
            email: user.email.toLowerCase(),
            name: user.name || 'Subscriber',
            is_active: true,
            preferences: {
              new_arrivals: preferences.new_arrivals,
              special_offers: preferences.special_offers,
              islamic_insights: preferences.islamic_insights
            },
            updated_at: new Date().toISOString()
          });

        if (newsletterError) {
          console.error('Newsletter update error:', newsletterError);
        }
      } else {
        // Unsubscribe from newsletter
        await supabase
          .from('newsletter_subscribers')
          .update({ is_active: false })
          .eq('email', user.email.toLowerCase());
      }

      setStatus('success');
      setMessage('Email preferences updated successfully!');
    } catch (error) {
      console.error('Error saving email preferences:', error);
      setStatus('error');
      setMessage('Failed to update preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferenceChange = (key: keyof EmailPreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const preferenceOptions = [
    {
      key: 'order_updates' as keyof EmailPreferences,
      label: 'Order Updates',
      description: 'Receive notifications about your order status changes',
      icon: <Bell className="w-5 h-5" />,
      required: true
    },
    {
      key: 'shipping_notifications' as keyof EmailPreferences,
      label: 'Shipping Notifications',
      description: 'Get notified when your orders are shipped and delivered',
      icon: <Mail className="w-5 h-5" />,
      required: true
    },
    {
      key: 'newsletter' as keyof EmailPreferences,
      label: 'Newsletter',
      description: 'Receive our weekly newsletter with Islamic insights and updates',
      icon: <BookOpen className="w-5 h-5" />,
      required: false
    },
    {
      key: 'new_arrivals' as keyof EmailPreferences,
      label: 'New Arrivals',
      description: 'Be the first to know about new Islamic books and publications',
      icon: <BookOpen className="w-5 h-5" />,
      required: false
    },
    {
      key: 'special_offers' as keyof EmailPreferences,
      label: 'Special Offers',
      description: 'Receive exclusive discounts and promotional offers',
      icon: <Tag className="w-5 h-5" />,
      required: false
    },
    {
      key: 'islamic_insights' as keyof EmailPreferences,
      label: 'Islamic Insights',
      description: 'Get weekly Islamic knowledge, quotes, and spiritual guidance',
      icon: <BookOpen className="w-5 h-5" />,
      required: false
    }
  ];

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center mb-6">
        <Settings className="w-5 h-5 text-naaz-green mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Email Preferences</h2>
      </div>

      <p className="text-gray-600 mb-6">
        Choose which emails you'd like to receive from us. You can update these preferences at unknown time.
      </p>

      <div className="space-y-4">
        {preferenceOptions.map((option) => (
          <div key={option.key} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
            <div className="flex-shrink-0 mt-1">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences[option.key]}
                  onChange={(e) => handlePreferenceChange(option.key, e.target.checked)}
                  disabled={option.required || isSaving}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-naaz-green/20 rounded border-2 border-gray-300 peer-checked:bg-naaz-green peer-checked:border-naaz-green relative">
                  {preferences[option.key] && (
                    <CheckCircle className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
                  )}
                </div>
              </label>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <div className="text-naaz-green">
                  {option.icon}
                </div>
                <h3 className="font-medium text-gray-900">
                  {option.label}
                  {option.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </h3>
              </div>
              <p className="text-sm text-gray-600">{option.description}</p>
              {option.required && (
                <p className="text-xs text-gray-500 mt-1">
                  Required for account functionality
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={savePreferences}
          disabled={isSaving}
          className="bg-naaz-green text-white px-6 py-2 rounded-lg hover:bg-naaz-green/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            'Save Preferences'
          )}
        </button>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="flex items-center text-green-600 text-sm">
            <CheckCircle className="w-4 h-4 mr-2" />
            {message}
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {message}
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Privacy Notice</h4>
        <p className="text-sm text-gray-600">
          We respect your privacy and will never share your email address with third parties. 
          You can unsubscribe from unknown email list at unknown time by clicking the unsubscribe link 
          in our emails or by updating your preferences here.
        </p>
      </div>
    </div>
  );
};

export default EmailPreferences;
