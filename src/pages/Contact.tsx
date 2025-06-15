
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Banner */}
        <div className="relative h-64 overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/lovable-uploads/alt-bg.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.7)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-naaz-green/80 to-transparent" />
          <div className="relative container mx-auto h-full flex flex-col justify-center px-4">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-white mb-2">Contact Us</h1>
            <p className="text-white/90 max-w-xl">
              Connect with Naaz Book Depot - Your trusted source for Islamic literature since 1967
            </p>
          </div>
        </div>

        {/* Contact Details */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-10">
              {/* Contact Form */}
              <div>
                <h2 className="text-2xl font-playfair font-bold text-naaz-green mb-6">Send Us a Message</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-gray-700 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-gray-700 mb-2">Email Address</label>
                      <input 
                        type="email" 
                        id="email" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                        placeholder="Your email"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-gray-700 mb-2">Subject</label>
                    <input 
                      type="text" 
                      id="subject" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                      placeholder="Subject"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-gray-700 mb-2">Message</label>
                    <textarea 
                      id="message" 
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                      placeholder="Your message"
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    className="bg-naaz-green text-white py-3 px-6 rounded-md hover:bg-naaz-green/90 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>

              {/* Contact Info */}
              <div>
                <h2 className="text-2xl font-playfair font-bold text-naaz-green mb-6">Contact Information</h2>
                <div className="bg-naaz-cream p-8 rounded-lg">
                  <div className="space-y-8">
                    <div className="flex items-start">
                      <MapPin className="text-naaz-gold mr-4 flex-shrink-0 mt-1" size={24} />
                      <div>
                        <h3 className="font-semibold text-naaz-green mb-1">Our Address</h3>
                        <p className="text-gray-700 mb-1">1, Ismail Madani Lane</p>
                        <p className="text-gray-700">Kolkata, West Bengal 700073, India</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Phone className="text-naaz-gold mr-4 flex-shrink-0 mt-1" size={24} />
                      <div>
                        <h3 className="font-semibold text-naaz-green mb-1">Phone Numbers</h3>
                        <p className="text-gray-700 mb-1">+91 90510 85118</p>
                        <p className="text-gray-700 mb-1">+91 91634 32935</p>
                        <p className="text-gray-700 mb-1">033 2235 0051</p>
                        <p className="text-gray-700">033 2233 0960</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <MessageCircle className="text-naaz-gold mr-4 flex-shrink-0 mt-1" size={24} />
                      <div>
                        <h3 className="font-semibold text-naaz-green mb-1">WhatsApp</h3>
                        <p className="text-gray-700">+91 91634 32935</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Mail className="text-naaz-gold mr-4 flex-shrink-0 mt-1" size={24} />
                      <div>
                        <h3 className="font-semibold text-naaz-green mb-1">Email Address</h3>
                        <p className="text-gray-700">naazgroupofficial@gmail.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock className="text-naaz-gold mr-4 flex-shrink-0 mt-1" size={24} />
                      <div>
                        <h3 className="font-semibold text-naaz-green mb-1">Business Hours</h3>
                        <p className="text-gray-700 mb-1">Monday-Saturday: 10:00 AM - 8:00 PM</p>
                        <p className="text-gray-700">Sunday: Closed</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10">
                    <h3 className="font-semibold text-naaz-green mb-3">Connect With Us</h3>
                    <div className="flex space-x-4">
                      <a href="#" className="bg-naaz-green text-white p-2 rounded-full hover:bg-naaz-gold transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                        </svg>
                      </a>
                      <a href="#" className="bg-naaz-green text-white p-2 rounded-full hover:bg-naaz-gold transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                      <a href="#" className="bg-naaz-green text-white p-2 rounded-full hover:bg-naaz-gold transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                        </svg>
                      </a>
                      <a href="#" className="bg-naaz-green text-white p-2 rounded-full hover:bg-naaz-gold transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Map */}
        <section className="pb-16 px-4">
          <div className="container mx-auto">
            <div className="bg-gray-200 h-96 rounded-lg overflow-hidden">
              {/* Replace with actual map component when available */}
              <div className="w-full h-full bg-naaz-green/20 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="text-naaz-green mx-auto mb-2" size={48} />
                  <span className="text-naaz-green font-semibold block">1, Ismail Madani Lane</span>
                  <span className="text-naaz-green">Kolkata, West Bengal 700073</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
