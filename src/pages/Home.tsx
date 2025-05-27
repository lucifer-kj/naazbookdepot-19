
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { BookOpen, Heart, Sparkles } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-naaz-cream">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-playfair font-bold text-naaz-green mb-6">
                Publishing the Light of Knowledge
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
                Since 1967, Naaz Book Depot has been your trusted companion in Islamic learning. 
                Discover authentic books, exquisite perfumes, and essential items that enrich your spiritual journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/books" 
                  className="bg-naaz-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-naaz-green/90 transition-colors"
                >
                  Explore Books
                </Link>
                <Link 
                  to="/about" 
                  className="border-2 border-naaz-green text-naaz-green px-8 py-3 rounded-lg font-semibold hover:bg-naaz-green hover:text-white transition-colors"
                >
                  Our Story
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green text-center mb-12">
              Our Offerings
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Books */}
              <div className="text-center p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-naaz-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="text-naaz-green" size={32} />
                </div>
                <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-3">
                  Islamic Books
                </h3>
                <p className="text-gray-600 mb-4">
                  Extensive collection of Quran, Hadith, Fiqh, Islamic history, and spiritual guidance books in multiple languages.
                </p>
                <Link 
                  to="/books" 
                  className="text-naaz-gold hover:text-naaz-green font-semibold transition-colors"
                >
                  Browse Collection →
                </Link>
              </div>

              {/* Perfumes */}
              <div className="text-center p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow opacity-60">
                <div className="w-16 h-16 bg-naaz-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="text-naaz-green" size={32} />
                </div>
                <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-3">
                  Islamic Perfumes
                </h3>
                <p className="text-gray-600 mb-4">
                  Premium collection of alcohol-free attars and Islamic fragrances crafted with traditional methods.
                </p>
                <span className="text-gray-400 font-semibold">
                  Coming Soon
                </span>
              </div>

              {/* Essentials */}
              <div className="text-center p-8 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow opacity-60">
                <div className="w-16 h-16 bg-naaz-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="text-naaz-green" size={32} />
                </div>
                <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-3">
                  Islamic Essentials
                </h3>
                <p className="text-gray-600 mb-4">
                  Prayer rugs, tasbeeh, Islamic art, and other essentials for your daily spiritual practice.
                </p>
                <span className="text-gray-400 font-semibold">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 px-4 bg-naaz-cream">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green mb-6">
                  A Legacy of Knowledge Since 1967
                </h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Founded in the heart of Kolkata, Naaz Book Depot has been a beacon of Islamic knowledge 
                  for over five decades. Our journey began with a simple mission: to make authentic Islamic 
                  literature accessible to every seeker of knowledge.
                </p>
                <p className="text-gray-700 mb-8 leading-relaxed">
                  Today, we continue this tradition by expanding our offerings to include premium Islamic 
                  perfumes and essential items, while maintaining our commitment to authenticity and quality.
                </p>
                <Link 
                  to="/about" 
                  className="bg-naaz-gold text-white px-6 py-3 rounded-lg font-semibold hover:bg-naaz-gold/90 transition-colors"
                >
                  Learn More About Us
                </Link>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-4">
                  Why Choose Naaz Book Depot?
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-naaz-gold mr-2">✓</span>
                    <span className="text-gray-700">Authentic Islamic literature from trusted publishers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-naaz-gold mr-2">✓</span>
                    <span className="text-gray-700">Over 55 years of serving the Muslim community</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-naaz-gold mr-2">✓</span>
                    <span className="text-gray-700">Expert guidance in selecting appropriate books</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-naaz-gold mr-2">✓</span>
                    <span className="text-gray-700">Competitive prices with nationwide shipping</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-naaz-gold mr-2">✓</span>
                    <span className="text-gray-700">Committed to Islamic values and ethics</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-naaz-green text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-6">
              Begin Your Journey of Knowledge Today
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of satisfied customers who trust Naaz Book Depot for their Islamic learning needs.
            </p>
            <Link 
              to="/books" 
              className="bg-naaz-gold text-naaz-green px-8 py-3 rounded-lg font-bold text-lg hover:bg-naaz-gold/90 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
