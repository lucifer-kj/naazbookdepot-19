
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Heart, Sparkles, ArrowRight, Mail } from 'lucide-react';

const ThreeDivisionsShowcase = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-naaz-cream/50 to-white scroll-animate opacity-0">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-naaz-green mb-4">
            Our Three Divisions
          </h2>
          <div className="w-24 h-1 bg-naaz-gold mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Expanding our reach to serve the complete spiritual and lifestyle needs of the Muslim community
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Books Division */}
          <div className="group bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="w-20 h-20 bg-gradient-to-br from-naaz-green to-naaz-green/80 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="text-white" size={36} />
            </div>
            <h3 className="text-2xl font-playfair font-semibold text-naaz-green mb-4 group-hover:text-naaz-gold transition-colors">
              Naaz Books
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Extensive collection of Islamic literature, Quran, Hadith, and scholarly works in multiple languages.
            </p>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6 inline-block">
              Available Now
            </div>
            <Link to="/products" className="group-hover:bg-naaz-green group-hover:text-white text-naaz-gold border border-naaz-gold px-6 py-3 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-2">
              Browse Collection 
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Perfumes Division */}
          <div className="group bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-naaz-gold text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
              Coming Soon
            </div>
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Heart className="text-white" size={36} />
            </div>
            <h3 className="text-2xl font-playfair font-semibold text-naaz-green mb-4">
              Naaz Perfumes
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Premium collection of alcohol-free Islamic fragrances and traditional attars.
            </p>
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-6 inline-block">
              Launch: Early 2025
            </div>
            <Link to="/perfumes" className="text-gray-500 border border-gray-300 px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-gray-50 transition-all duration-300">
              Get Notified
              <Mail size={18} />
            </Link>
          </div>

          {/* Essentials Division */}
          <div className="group bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-naaz-gold text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
              Coming Soon
            </div>
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="text-white" size={36} />
            </div>
            <h3 className="text-2xl font-playfair font-semibold text-naaz-green mb-4">
              Naaz Essentials
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Prayer rugs, tasbeeh, Islamic art, and essential items for spiritual practice.
            </p>
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-6 inline-block">
              Launch: Mid 2025
            </div>
            <Link to="/essentials" className="text-gray-500 border border-gray-300 px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-gray-50 transition-all duration-300">
              Stay Updated
              <Mail size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThreeDivisionsShowcase;
