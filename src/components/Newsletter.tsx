
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Here you'd typically send this to your email service API
    toast({
      title: "Thank you for subscribing!",
      description: "You'll receive our newsletter at " + email,
    });
    
    setEmail('');
  };

  return (
    <section className="bg-naaz-burgundy py-16 px-4">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-playfair font-bold text-white mb-4">Join Our Newsletter</h2>
        <p className="text-white/80 max-w-2xl mx-auto mb-8">
          Subscribe to receive updates on new products, special offers, and Islamic insights.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 px-4 py-3 rounded-md text-naaz-green focus:outline-none focus:ring-2 focus:ring-naaz-gold"
            required
          />
          <button 
            type="submit" 
            className="gold-button whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
        
        <p className="text-white/60 text-sm mt-6">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
};

export default Newsletter;
