
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
              A Legacy of Knowledge Since 1967
            </h2>
            <div className="w-24 h-1 bg-naaz-gold mb-6"></div>
            <p className="text-gray-700 mb-6 leading-relaxed text-lg">
              Founded in the heart of Kolkata, Naaz Book Depot has been a beacon of Islamic knowledge 
              for over five decades. Our journey began with a simple mission: to make authentic Islamic 
              literature accessible to every seeker of knowledge.
            </p>
            <p className="text-gray-700 mb-8 leading-relaxed text-lg">
              Today, we continue this tradition by expanding our offerings while maintaining our 
              commitment to authenticity and quality in Islamic education.
            </p>
            <Link to="/about" className="group bg-naaz-gold text-white px-8 py-4 rounded-xl font-semibold hover:bg-naaz-gold/90 transition-all duration-300 inline-flex items-center gap-3 transform hover:scale-105">
              Learn More About Us 
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="bg-gradient-to-br from-naaz-cream to-white p-8 rounded-2xl shadow-lg border border-naaz-gold/20">
            <h3 className="text-2xl font-playfair font-semibold text-naaz-green mb-8">
              Key Milestones
            </h3>
            <div className="space-y-6">
              {[
                { year: '1967', desc: 'Founded in Kolkata as a small Islamic bookstore' },
                { year: '1980s', desc: 'Became a leading distributor of Islamic literature in Bengal' },
                { year: '2000s', desc: 'Expanded to serve customers across India' },
                { year: '2024', desc: 'Launched online platform for global reach' }
              ].map((milestone, index) => (
                <div key={index} className="flex items-start group">
                  <span className="text-naaz-gold mr-4 font-bold text-lg min-w-[60px] group-hover:scale-110 transition-transform">
                    {milestone.year}
                  </span>
                  <div className="flex-1">
                    <div className="h-0.5 bg-naaz-gold/30 group-hover:bg-naaz-gold transition-colors mb-2"></div>
                    <span className="text-gray-700 leading-relaxed">{milestone.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreviewSection;
