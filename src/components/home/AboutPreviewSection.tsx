
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const AboutPreviewSection = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-naaz-cream/30 scroll-animate opacity-0">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          <div>
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-naaz-green mb-6">
              A Legendary Legacy Since 1967
            </h2>
            <div className="w-24 h-1 bg-naaz-gold mb-6"></div>
            <p className="text-gray-700 mb-6 leading-relaxed text-lg">
              Founded in the heart of Kolkata, Naaz Book Depot has been a beacon of Islamic knowledge 
              for over five decades under the visionary leadership of MD Irfan. With over 60 years of 
              experience, he has personally overseen the publication of more than 2,000 Islamic titles.
            </p>
            <p className="text-gray-700 mb-8 leading-relaxed text-lg">
              Known throughout India as a legendary figure in Islamic publishing, MD Irfan continues 
              this tradition of authentic Islamic literature, serving the Ummah with unwavering dedication 
              and commitment to spreading Qur'anic knowledge.
            </p>
            <Link to="/about" className="group bg-naaz-gold text-white px-8 py-4 rounded-xl font-semibold hover:bg-naaz-gold/90 transition-all duration-300 inline-flex items-center gap-3 transform hover:scale-105">
              Learn More About Our Legacy
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="bg-gradient-to-br from-naaz-cream to-white p-8 rounded-2xl shadow-lg border border-naaz-gold/20">
            <img
              src="lovable-uploads/Owner.jpg"
              alt="MD Irfan, Director of Naaz Book Depot"
              className="w-full h-auto rounded-lg shadow-md"
              loading="lazy"
            />
            <div className="mt-6 text-center">
              <p className="text-lg text-gray-700 font-semibold">
                MD Irfan
              </p>
              <p className="text-sm text-naaz-gold font-semibold mt-1">
                Founder, Naaz Book Depot
              </p>
              <p className="text-xs text-gray-600 mt-2">
                A legendary figure in Islamic publishing
              </p>
            </div>
          </div>  
        </div>
      </div>
    </section>
  );
};

export default AboutPreviewSection;
