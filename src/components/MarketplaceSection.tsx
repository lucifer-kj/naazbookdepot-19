
import React from 'react';
import { Link } from 'react-router-dom';

const MarketplaceSection = () => {
  return (
    <section className="py-8 md:py-16 px-4 w-full">
      <div className="w-full max-w-[2000px] mx-auto">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
          <div className="animate-fade-up">
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-playfair font-bold text-naaz-green mb-4 md:mb-6">
              Our Marketplace
            </h2>
            <div className="prose prose-sm md:prose-lg text-gray-700 max-w-xl">
              <p className="mb-3 md:mb-4">
                Founded in 1960, Naaz Marketplace has grown into a trusted destination for premium Islamic products in India. 
                Our journey began with books and has expanded to include fragrances and essential items.
              </p>
              <p className="mb-4 md:mb-6">
                Today, we operate three specialized shops—each with its own focus and expertise—united by our commitment 
                to quality, authenticity, and exceptional customer service in Mumbai and Kolkata.
              </p>
              <Link to="/about" className="gold-button inline-block w-full text-center sm:w-auto">
                Explore Our Shops
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative">
              <img 
                src="/lovable-uploads/61ad7a88-c8e2-42f6-b3b1-567415b3c17e.png" 
                alt="Naaz Marketplace" 
                className="rounded-lg shadow-lg object-cover w-full h-[300px] md:h-[400px]"
              />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 md:w-24 md:h-24 bg-naaz-gold rounded-full flex items-center justify-center">
                <span className="text-naaz-green font-playfair font-bold text-sm md:text-base">60+ Years</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketplaceSection;
