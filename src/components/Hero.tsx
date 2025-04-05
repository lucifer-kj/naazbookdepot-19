
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative h-[600px] md:h-[700px] overflow-hidden">
      {/* Hero Image with Overlay */}
      <div 
        className="absolute inset-0 bg-naaz-green bg-opacity-60"
        style={{
          backgroundImage: "url('/lovable-uploads/35307c97-3aa6-4608-bf4e-4dfa8ccc9a0c.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-3xl animate-fade-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-playfair font-bold text-white mb-6">
            Discover the Naaz Marketplace Family
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Explore our premium collection of Islamic perfumes, books, and essential items across our specialized shops.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/shops" className="gold-button inline-block text-center">
              Visit Our Shops
            </Link>
            <Link to="/blog" className="accent-button inline-block text-center">
              Explore Our Blog
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
