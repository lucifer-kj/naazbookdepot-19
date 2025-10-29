
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';

const HeroSection = () => {
  const [typewriterText, setTypewriterText] = useState('');
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  
  const fullTypewriterText = "Publishing the Light of Knowledge since 1967";

  // Typewriter effect
  useEffect(() => {
    if (typewriterIndex < fullTypewriterText.length) {
      const timer = setTimeout(() => {
        setTypewriterText(prev => prev + fullTypewriterText[typewriterIndex]);
        setTypewriterIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [typewriterIndex]);

  return (
    <section className="relative h-[76vh] overflow-hidden">
      {/* Background with parallax effect */}
      <div 
        className="absolute inset-0 bg-naaz-green transform scale-110 transition-transform duration-1000" 
        style={{
          backgroundImage: "url('/lovable-uploads/background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }} 
      />
      
      {/* Semi-transparent overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-naaz-green/80 via-naaz-green/60 to-naaz-green/80"></div>

      {/* Enhanced Glassmorphism Quranic Verse Overlay */}
      <div className="hidden lg:block absolute top-8 right-8 max-w-[350px] p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] text-right transform hover:scale-105 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
        <div className="relative z-10">
          <p className="font-arabic text-white text-xl leading-relaxed mb-4 drop-shadow-lg">
            اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
            <br />
            خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ
            <br />
            اقْرَأْ وَرَبُّكَ الْأَكْرَمُ
            <br />
            الَّذِي عَلَّمَ بِالْقَلَمِ
            <br />
            عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ
          </p>
          <p className="text-white/90 text-sm italic leading-relaxed">
            "Read in the name of your Lord who created—
            Created man from a clot.
            Read, and your Lord is the Most Generous—
            Who taught by the pen—
            Taught man that which he knew not."
            <span className="block mt-2 text-white/70 text-xs font-semibold">
              (Surah Al-'Alaq, 96:1–5)
            </span>
          </p>
        </div>
      </div>

      {/* Content - Restored left alignment */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-3xl text-left">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold text-white mb-6 animate-fade-in transform translate-x-0 opacity-100 transition-all duration-1000 drop-shadow-2xl text-left">
            Naaz Book Depot
          </h1>
          
          {/* Typewriter effect */}
          <div className="mb-8 text-left">
            <p className="text-xl md:text-2xl text-white/95 font-playfair italic min-h-[2.5rem] text-left">
              "{typewriterText}"
              <span className="animate-pulse ml-1 text-naaz-gold">|</span>
            </p>
          </div>
          
          <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl text-left">
            A pioneering publishing company since 1967, specializing in authentic Islamic literature 
            and the Qur'an in multiple languages, serving the global Muslim community.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in justify-start">
            <Link to="/about" className="group bg-naaz-gold text-naaz-green px-8 py-4 rounded-xl font-bold hover:bg-naaz-gold/90 transition-all duration-300 text-center transform hover:scale-105 hover:shadow-2xl">
              <span className="flex items-center justify-center gap-2">
                Discover Our Legacy
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link to="/products" className="group border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-naaz-green transition-all duration-300 text-center transform hover:scale-105">
              <span className="flex items-center justify-center gap-2">
                Explore Books
                <BookOpen size={20} className="group-hover:rotate-12 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
