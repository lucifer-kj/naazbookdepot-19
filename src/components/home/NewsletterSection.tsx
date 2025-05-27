
import React from 'react';

const NewsletterSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-naaz-green to-naaz-green/90 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20v20h20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="container mx-auto text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-6">
            Stay Connected with Islamic Knowledge
          </h2>
          <div className="w-24 h-1 bg-naaz-gold mx-auto mb-8"></div>
          <p className="text-xl mb-12 text-white/90 leading-relaxed">
            Join our community and receive updates on new Islamic books, scholarly articles, and spiritual guidance.
          </p>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
              <input 
                type="email" 
                placeholder="Enter your email for blessed updates" 
                className="flex-1 px-6 py-4 rounded-xl text-gray-800 outline-none focus:ring-2 focus:ring-naaz-gold transition-all" 
              />
              <button className="bg-naaz-gold hover:bg-naaz-gold/90 text-naaz-green px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105">
                Subscribe
              </button>
            </div>
            
            <p className="text-white/80 text-sm mt-6 italic">
              "And whoever seeks knowledge, Allah will make the path to Paradise easy for him" - Prophet Muhammad (PBUH)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
