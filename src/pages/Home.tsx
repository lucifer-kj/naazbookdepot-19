
import React from 'react';
import { Link } from 'react-router-dom';
import { Book, Truck, Shield, Award, Star } from 'lucide-react';

const Home = () => {
  const infoItems = [
    '📞 Call us: +91 98765 43210',
    '✉️ Email: info@naazbookdepot.com',
    '📍 Location: Kolkata, West Bengal',
    '🚚 Free delivery on orders above ₹500',
    '📖 Authentic Islamic literature since 1967',
    '⭐ Trusted by 10,000+ customers',
    '🔒 100% secure payment',
    '📞 Call us: +91 98765 43210' // Duplicate to ensure seamless loop
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Horizontal Scrolling Info Strip */}
      <div className="bg-naaz-green text-white py-2 overflow-hidden">
        <div className="animate-scroll whitespace-nowrap">
          {infoItems.map((item, index) => (
            <span key={index} className="inline-block mx-8 text-sm">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-naaz-cream to-white py-24 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-playfair font-bold text-naaz-green mb-6">
            Welcome to Naaz Book Depot
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Your trusted source for authentic Islamic literature, knowledge, and wisdom. 
            Serving the community since 1967 with devotion and excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/books" 
              className="bg-naaz-green text-white px-8 py-3 rounded-lg hover:bg-naaz-green/90 transition-colors font-medium"
            >
              Browse Islamic Books
            </Link>
            <Link 
              to="/about" 
              className="border-2 border-naaz-green text-naaz-green px-8 py-3 rounded-lg hover:bg-naaz-green hover:text-white transition-colors font-medium"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-playfair font-bold text-center text-naaz-green mb-12">
            Why Choose Naaz Book Depot?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-naaz-green text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Book size={32} />
              </div>
              <h3 className="text-xl font-semibold text-naaz-green mb-2">Authentic Literature</h3>
              <p className="text-gray-600">Curated collection of authentic Islamic books and scholarly works</p>
            </div>
            <div className="text-center">
              <div className="bg-naaz-green text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck size={32} />
              </div>
              <h3 className="text-xl font-semibold text-naaz-green mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick and reliable delivery across India with careful packaging</p>
            </div>
            <div className="text-center">
              <div className="bg-naaz-green text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-semibold text-naaz-green mb-2">Trusted Quality</h3>
              <p className="text-gray-600">Over 55 years of experience in serving the Islamic community</p>
            </div>
            <div className="text-center">
              <div className="bg-naaz-green text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award size={32} />
              </div>
              <h3 className="text-xl font-semibold text-naaz-green mb-2">Expert Curation</h3>
              <p className="text-gray-600">Books selected by Islamic scholars and knowledge experts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-playfair font-bold text-center text-naaz-green mb-12">
            Featured Categories
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/books?category=quran" className="group">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-br from-naaz-green to-naaz-gold"></div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-naaz-green mb-2 group-hover:text-naaz-gold transition-colors">
                    Quran & Tafseer
                  </h3>
                  <p className="text-gray-600">
                    Complete Quran with translations and detailed commentary by renowned scholars
                  </p>
                </div>
              </div>
            </Link>
            <Link to="/books?category=hadith" className="group">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-br from-naaz-gold to-naaz-green"></div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-naaz-green mb-2 group-hover:text-naaz-gold transition-colors">
                    Hadith Collections
                  </h3>
                  <p className="text-gray-600">
                    Authentic hadith collections including Sahih Bukhari, Muslim, and more
                  </p>
                </div>
              </div>
            </Link>
            <Link to="/books?category=islamic-history" className="group">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-br from-naaz-green/80 to-naaz-gold/80"></div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-naaz-green mb-2 group-hover:text-naaz-gold transition-colors">
                    Islamic History
                  </h3>
                  <p className="text-gray-600">
                    Comprehensive books on Islamic history, biographies, and civilization
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-playfair font-bold text-center text-naaz-green mb-12">
            What Our Customers Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Excellent collection of authentic Islamic books. The quality is outstanding and delivery was prompt."
              </p>
              <p className="font-semibold text-naaz-green">- Ahmed Hassan</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Been buying from Naaz Book Depot for years. Their service and book selection is unmatched."
              </p>
              <p className="font-semibold text-naaz-green">- Fatima Khan</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={20} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Great experience! Found rare Islamic texts that I couldn't find elsewhere. Highly recommended."
              </p>
              <p className="font-semibold text-naaz-green">- Dr. Mohammad Ali</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-naaz-green text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-playfair font-bold mb-6">
            Start Your Journey of Knowledge Today
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Explore our vast collection of Islamic literature and deepen your understanding
          </p>
          <Link 
            to="/books" 
            className="bg-white text-naaz-green px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium inline-block"
          >
            Browse All Books
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
