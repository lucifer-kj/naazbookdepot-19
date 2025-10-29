import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { emailService } from '@/lib/services/emailService';

interface NewsletterSubscriptionProps {
  className?: string;
  variant?: 'default' | 'footer' | 'popup';
}

export const NewsletterSubscription = ({ 
  className = '', 
  variant = 'default' 
}: NewsletterSubscriptionProps) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    if (!name.trim() && variant !== 'footer') {
      setStatus('error');
      setMessage('Please enter your name');
      return;
    }

    setIsLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      // Check if email is already subscribed
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .single();

      if (existing) {
        setStatus('error');
        setMessage('This email is already subscribed to our newsletter');
        return;
      }

      // Add to newsletter subscribers
      const { error: subscribeError } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: email.trim().toLowerCase(),
          name: name.trim() || 'Subscriber',
          subscribed_at: new Date().toISOString(),
          is_active: true,
          preferences: {
            new_arrivals: true,
            special_offers: true,
            islamic_insights: true
          }
        });

      if (subscribeError) {
        throw subscribeError;
      }

      // Send confirmation email
      await emailService.sendNewsletterConfirmation(
        email.trim().toLowerCase(), 
        name.trim() || 'Subscriber'
      );

      setStatus('success');
      setMessage('Thank you for subscribing! Please check your email for confirmation.');
      setEmail('');
      setName('');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setStatus('error');
      setMessage('Failed to subscribe. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'footer':
        return {
          container: 'bg-naaz-green/10 p-4 rounded-lg',
          title: 'text-lg font-semibold text-naaz-green mb-2',
          description: 'text-sm text-gray-600 mb-4',
          form: 'space-y-3',
          input: 'w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-naaz-green focus:border-transparent text-sm',
          button: 'w-full bg-naaz-green text-white py-2 px-4 rounded-md hover:bg-naaz-green/90 transition-colors text-sm font-medium'
        };
      case 'popup':
        return {
          container: 'bg-white p-6 rounded-xl shadow-lg border',
          title: 'text-xl font-bold text-gray-900 mb-2',
          description: 'text-gray-600 mb-6',
          form: 'space-y-4',
          input: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-naaz-green focus:border-transparent',
          button: 'w-full bg-naaz-green text-white py-3 px-6 rounded-lg hover:bg-naaz-green/90 transition-colors font-medium'
        };
      default:
        return {
          container: 'bg-white p-6 rounded-lg shadow-sm border',
          title: 'text-lg font-semibold text-gray-900 mb-2',
          description: 'text-gray-600 mb-4',
          form: 'space-y-4',
          input: 'w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-naaz-green focus:border-transparent',
          button: 'w-full bg-naaz-green text-white py-2 px-4 rounded-md hover:bg-naaz-green/90 transition-colors font-medium'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`${styles.container} ${className}`}>
      <div className="flex items-center mb-3">
        <Mail className="w-5 h-5 text-naaz-green mr-2" />
        <h3 className={styles.title}>Stay Updated</h3>
      </div>
      
      <p className={styles.description}>
        Subscribe to our newsletter for the latest Islamic books, special offers, and spiritual insights.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        {variant !== 'footer' && (
          <div>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              disabled={isLoading}
            />
          </div>
        )}
        
        <div>
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`${styles.button} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Subscribing...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Subscribe
            </>
          )}
        </button>
      </form>

      {/* Status Messages */}
      {status === 'success' && (
        <div className="mt-4 flex items-center text-green-600 text-sm">
          <CheckCircle className="w-4 h-4 mr-2" />
          {message}
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 flex items-center text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mr-2" />
          {message}
        </div>
      )}

      {variant !== 'footer' && (
        <div className="mt-4 text-xs text-gray-500">
          <p>We respect your privacy. Unsubscribe at unknown time.</p>
        </div>
      )}
    </div>
  );
};

export default NewsletterSubscription;
