
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative h-[600px] md:h-[700px] overflow-hidden">
      {/* Hero Image with Overlay */}
      <div 
        className="absolute inset-0 bg-naaz-green"
        style={{
          backgroundImage: "url('/lovable-uploads/61ad7a88-c8e2-42f6-b3b1-567415b3c17e.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.7)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl animate-fade-up">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold text-white mb-4">
            Naaz Book Depot – Kolkata
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-6 font-playfair italic">
            "Publishing the Light of Knowledge"
          </p>
          <p className="text-lg text-white/90 mb-8">
            A pioneering publishing company since 1967, specializing in Islamic literature and the Qur'an in multiple languages.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/about" className="gold-button inline-block text-center">
              About Us
            </Link>
            <Link to="/contact" className="accent-button inline-block text-center">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce text-white">
        <ChevronDown size={32} />
      </div>
    </div>
  );
};

export default Hero;
