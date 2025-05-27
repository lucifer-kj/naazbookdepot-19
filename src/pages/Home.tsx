
import React, { useState, useEffect } from 'react';
import { MessageCircle, ArrowUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactInfoStrip from '../components/home/ContactInfoStrip';
import HeroSection from '../components/home/HeroSection';
import FeaturedBooksCarousel from '../components/home/FeaturedBooksCarousel';
import ThreeDivisionsShowcase from '../components/home/ThreeDivisionsShowcase';
import AboutPreviewSection from '../components/home/AboutPreviewSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import NewsletterSection from '../components/home/NewsletterSection';

const Home = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);

      // Animate elements on scroll
      const elements = document.querySelectorAll('.scroll-animate');
      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('animate-fade-in');
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <div className="min-h-screen bg-naaz-cream">
        <Navbar />
        <ContactInfoStrip />
        <HeroSection />
        <FeaturedBooksCarousel />
        <ThreeDivisionsShowcase />
        <AboutPreviewSection />
        <TestimonialsSection />
        <NewsletterSection />

        {/* Floating WhatsApp Button */}
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
          <a 
            href="https://wa.me/919163431395" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 animate-pulse"
          >
            <MessageCircle size={24} />
          </a>
        </div>

        {/* Back to Top Button */}
        {showBackToTop && (
          <button 
            onClick={scrollToTop} 
            className="fixed bottom-6 left-6 bg-naaz-gold hover:bg-naaz-gold/90 text-white p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-300 z-50"
          >
            <ArrowUp size={20} />
          </button>
        )}

        <Footer />
      </div>
    </>
  );
};

export default Home;
