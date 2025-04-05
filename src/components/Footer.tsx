
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-naaz-green text-white">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-playfair font-bold mb-4 text-naaz-gold">The Naaz Group</h3>
            <p className="mb-4 text-white/80">
              Premium Islamic products serving the community since 1980. Offering books, perfumes, and essential accessories.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-naaz-gold transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-naaz-gold transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white hover:text-naaz-gold transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-playfair font-bold mb-4 text-naaz-gold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/books" className="text-white/80 hover:text-naaz-gold transition-colors">
                  Islamic Books
                </Link>
              </li>
              <li>
                <Link to="/perfumes" className="text-white/80 hover:text-naaz-gold transition-colors">
                  Non-Alcoholic Perfumes
                </Link>
              </li>
              <li>
                <Link to="/essentials" className="text-white/80 hover:text-naaz-gold transition-colors">
                  Islamic Essentials
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-white/80 hover:text-naaz-gold transition-colors">
                  Blog & Articles
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-white/80 hover:text-naaz-gold transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div>
            <h3 className="text-xl font-playfair font-bold mb-4 text-naaz-gold">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-white/80 hover:text-naaz-gold transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-white/80 hover:text-naaz-gold transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-white/80 hover:text-naaz-gold transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-white/80 hover:text-naaz-gold transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-white/80 hover:text-naaz-gold transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-xl font-playfair font-bold mb-4 text-naaz-gold">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-naaz-gold flex-shrink-0 mt-1" />
                <span className="text-white/80">123 Chowringhee Road, Kolkata, West Bengal, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-naaz-gold" />
                <span className="text-white/80">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-naaz-gold" />
                <span className="text-white/80">info@naazgroup.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} The Naaz Group. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6 w-auto" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6 w-auto" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" alt="PayPal" className="h-6 w-auto" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
