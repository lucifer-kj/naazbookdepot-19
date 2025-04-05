
import React from 'react';
import { Link } from 'react-router-dom';

const MarketplaceSection = () => {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="animate-fade-up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-naaz-green mb-6">
              Our Marketplace
            </h2>
            <div className="prose prose-lg text-gray-700 max-w-xl">
              <p className="mb-4">
                Founded in 1960, Naaz Marketplace has grown into a trusted destination for premium Islamic products in India. 
                Our journey began with books and has expanded to include fragrances and essential items.
              </p>
              <p className="mb-6">
                Today, we operate three specialized shops—each with its own focus and expertise—united by our commitment 
                to quality, authenticity, and exceptional customer service in Mumbai and Kolkata.
              </p>
              <Link to="/about" className="gold-button inline-block">
                Explore Our Shops
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative">
              <img 
                src="/lovable-uploads/61ad7a88-c8e2-42f6-b3b1-567415b3c17e.png" 
                alt="Naaz Marketplace" 
                className="rounded-lg shadow-lg object-cover w-full h-[400px]"
              />
              <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-naaz-gold rounded-full flex items-center justify-center">
                <span className="text-naaz-green font-playfair font-bold">60+ Years</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketplaceSection;
