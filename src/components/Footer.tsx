
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-naaz-green text-white">
      {/* Newsletter Section */}
      <div className="bg-naaz-green/90 py-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-playfair font-semibold mb-2">
            Stay Connected with Islamic Knowledge
          </h3>
          <p className="text-white/80 mb-4">
            Subscribe to receive updates on new Islamic books and spiritual guidance
          </p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg text-gray-800 outline-none"
            />
            <button className="bg-naaz-gold hover:bg-naaz-gold/90 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-xl font-playfair font-bold mb-4">Naaz Book Depot</h3>
              <p className="text-white/80 mb-4">
                Publishing the Light of Knowledge since 1967. Your trusted source for authentic Islamic literature 
                in Kolkata, West Bengal. Over 2,000 Islamic books published under the guidance of MD Irfan.
              </p>
              <div className="text-sm text-white/70">
                <p className="mb-1">🕌 Serving the Muslim Ummah</p>
                <p className="mb-1">📚 2000+ Islamic titles published</p>
                <p>🌟 Est. 1967 - Over 55 years of trust</p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-playfair font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-white/80 hover:text-naaz-gold transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/books" className="text-white/80 hover:text-naaz-gold transition-colors">
                    Islamic Books
                  </Link>
                </li>
                <li>
                  <span className="text-white/50">Perfumes (Coming Soon)</span>
                </li>
                <li>
                  <span className="text-white/50">Essentials (Coming Soon)</span>
                </li>
                <li>
                  <Link to="/about" className="text-white/80 hover:text-naaz-gold transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-white/80 hover:text-naaz-gold transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="text-white/80 hover:text-naaz-gold transition-colors">
                    Internals
                  </Link>
                </li>
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-lg font-playfair font-semibold mb-4">Book Categories</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/books?category=quran" className="text-white/80 hover:text-naaz-gold transition-colors">
                    Quran & Tafseer
                  </Link>
                </li>
                <li>
                  <Link to="/books?category=hadith" className="text-white/80 hover:text-naaz-gold transition-colors">
                    Hadith Collections
                  </Link>
                </li>
                <li>
                  <Link to="/books?category=fiqh" className="text-white/80 hover:text-naaz-gold transition-colors">
                    Islamic Jurisprudence
                  </Link>
                </li>
                <li>
                  <Link to="/books?category=history" className="text-white/80 hover:text-naaz-gold transition-colors">
                    Islamic History
                  </Link>
                </li>
                <li>
                  <Link to="/books?category=children" className="text-white/80 hover:text-naaz-gold transition-colors">
                    Children's Books
                  </Link>
                </li>
                <li>
                  <Link to="/books?category=urdu" className="text-white/80 hover:text-naaz-gold transition-colors">
                    Urdu Literature
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-playfair font-semibold mb-4">Contact Us</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="text-naaz-gold mr-2 flex-shrink-0 mt-1" size={16} />
                  <div className="text-sm text-white/80">
                    <p>1, Ismail Madani Lane</p>
                    <p>Kolkata, West Bengal 700073</p>
                    <p>India</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Phone className="text-naaz-gold mr-2" size={16} />
                  <div className="text-sm text-white/80">
                    <p>+91 90510 85118</p>
                    <p>033 2235 0051</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Mail className="text-naaz-gold mr-2" size={16} />
                  <span className="text-sm text-white/80">naazgroupofficial@gmail.com</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-6">
                <h5 className="font-semibold mb-3">Follow Us</h5>
                <div className="flex space-x-3">
                  <a href="#" className="bg-white/10 hover:bg-naaz-gold p-2 rounded-full transition-colors">
                    <Facebook size={18} />
                  </a>
                  <a href="#" className="bg-white/10 hover:bg-naaz-gold p-2 rounded-full transition-colors">
                    <Instagram size={18} />
                  </a>
                  <a href="#" className="bg-white/10 hover:bg-naaz-gold p-2 rounded-full transition-colors">
                    <Twitter size={18} />
                  </a>
                  <a href="#" className="bg-white/10 hover:bg-naaz-gold p-2 rounded-full transition-colors">
                    <Youtube size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/20 py-6 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-white/70">
            <div>
              <p>&copy; 2024 Naaz Book Depot. All rights reserved.</p>
              <p className="font-arabic mt-1">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</p>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="hover:text-naaz-gold transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-naaz-gold transition-colors">
                Terms of Service
              </Link>
              <Link to="/shipping" className="hover:text-naaz-gold transition-colors">
                Shipping Info
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
