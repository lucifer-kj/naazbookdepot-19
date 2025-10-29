
import React, { useState } from 'react';
import { useNewsletterSubscription } from '@/lib/hooks/useNewsletter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const { mutate: subscribe, isPending } = useNewsletterSubscription();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    subscribe(
      { email, name },
      {
        onSuccess: () => {
          toast.success('Successfully subscribed to our newsletter!');
          setEmail('');
          setName('');
        },
        onError: () => {
          toast.error('Failed to subscribe. Please try again.');
        },
      }
    );
  };

  return (
    <section className="py-16 bg-naaz-teal">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Stay Updated with Our Latest Books
          </h2>
          <p className="text-naaz-cream text-lg mb-8">
            Subscribe to our newsletter and be the first to know about new releases, 
            special offers, and literary events at Naaz Book Depot.
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <Input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/90 border-0 text-naaz-brown placeholder:text-naaz-brown/60"
            />
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/90 border-0 text-naaz-brown placeholder:text-naaz-brown/60"
            />
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-naaz-brown hover:bg-naaz-brown/90 text-white py-3 text-lg font-medium"
            >
              {isPending ? 'Subscribing...' : 'Subscribe to Newsletter'}
            </Button>
          </form>
          
          <p className="text-naaz-cream/80 text-sm mt-4">
            We respect your privacy. Unsubscribe at unknown time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
