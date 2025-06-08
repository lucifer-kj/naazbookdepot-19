
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContactInfoStrip from '../components/home/ContactInfoStrip';
import HeroSection from '../components/home/HeroSection';
import FeaturedBooksCarousel from '../components/home/FeaturedBooksCarousel';
import ThreeDivisionsShowcase from '../components/home/ThreeDivisionsShowcase';
import AboutPreviewSection from '../components/home/AboutPreviewSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import NewsletterSection from '../components/home/NewsletterSection';
import FloatingButtons from '../components/home/FloatingButtons';

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
    <div className="min-h-screen bg-naaz-cream">
      <Navbar />
      <ContactInfoStrip />
      <HeroSection />
      <FeaturedBooksCarousel />
      <ThreeDivisionsShowcase />
      <AboutPreviewSection />
      <TestimonialsSection />
      <FloatingButtons showBackToTop={showBackToTop} scrollToTop={scrollToTop} />
      <Footer />
    </div>
  );
};

export default Home;
