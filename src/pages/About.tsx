
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { Book, Award, Users, Heart, Calendar, MapPin, Phone, Mail } from 'lucide-react';

const About = () => {
 
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
          <div className="absolute inset-0 bg-gradient-to-r from-naaz-green/90 to-transparent" />
          <div className="relative container mx-auto h-full flex flex-col justify-center px-4">
            <h1 className="text-4xl md:text-6xl font-playfair font-bold text-white mb-4">About Naaz Book Depot</h1>
            <p className="text-xl text-white/90 max-w-2xl font-arabic">
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
            </p>
            <p className="text-lg text-white/90 max-w-2xl mt-2">
              "Jazakum Allahu Khayran" - May Allah reward you with goodness
            </p>
          </div>
        </div>

        {/* Company Story */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
              <div>
                <h2 className="text-4xl md:text-5xl font-playfair font-bold text-naaz-green mb-6">
                  A Legendary Legacy Since 1967
                </h2>
                <div className="w-24 h-1 bg-naaz-gold mb-6"></div>
                <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                  Founded in the heart of Kolkata in 1967, Naaz Book Depot has served as a beacon of Islamic knowledge for over five decades. What started as a humble mission has evolved into a legendary legacy in the Islamic publishing community.
                </p>
        
                <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                  At the core of this mission stands <strong>MD Irfan</strong>, the esteemed Director of Naaz Book Depot. With over 60 years of experience in Islamic publishing, he has personally overseen the publication of <strong>more than 2,000 Islamic titles</strong>, including Qur'ans, Tafsir, Duas, Rukyas, and other essential texts.
                </p>

                <p className="text-gray-700 mb-8 leading-relaxed text-lg">
                  Known throughout India for his unwavering commitment to Islamic knowledge, MD Irfan has transformed Naaz Book Depot into a vital source of authentic Islamic literature, serving the Ummah with dedication and Islamic principles.
                </p>
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
                    Director, Naaz Book Depot
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    A lifelong contributor to Qur'anic knowledge
                  </p>
                </div>
              </div>  
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-16 px-4 bg-naaz-cream">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-playfair font-bold text-naaz-green mb-6">Our Mission & Values</h2>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <Heart className="text-naaz-gold mr-4 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h3 className="font-semibold text-naaz-green mb-2">Authentic Islamic Knowledge</h3>
                      <p className="text-gray-700">We are committed to publishing only authentic Islamic literature, verified by qualified scholars and rooted in traditional Islamic teachings.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Book className="text-naaz-gold mr-4 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h3 className="font-semibold text-naaz-green mb-2">Educational Excellence</h3>
                      <p className="text-gray-700">Making Islamic education accessible through quality publications in multiple languages - Arabic, Urdu, Bengali, and English.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users className="text-naaz-gold mr-4 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h3 className="font-semibold text-naaz-green mb-2">Serving the Ummah</h3>
                      <p className="text-gray-700">Selflessly serving the Muslim community worldwide with dedication, integrity, and Islamic principles for over 60 years.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col gap-6">
                <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-4">Testimonials About Our Work</h3>
                <div className="space-y-4">
                  <blockquote className="border-l-4 border-naaz-gold pl-4 text-gray-700 italic">
                    "Your dedication to publishing authentic Islamic literature is a source of immense benefit to the Ummah."
                  </blockquote>
                  <blockquote className="border-l-4 border-naaz-gold pl-4 text-gray-700 italic">
                    "May Allah bless your efforts in spreading knowledge and making Islamic teachings accessible to all."
                  </blockquote>
                  <blockquote className="border-l-4 border-naaz-gold pl-4 text-gray-700 italic">
                    "Your work in publishing Qur'ans and Islamic books is a true form of Sadaqah Jariyah (continuous charity), benefiting generations to come."
                  </blockquote>
                </div>
                <div className="mt-4 p-4 bg-naaz-cream rounded-lg">
                  <p className="text-center text-naaz-green font-semibold">
                    📚 Over 2,000 Islamic Books Published
                  </p>
                  <p className="text-center text-sm text-gray-600 mt-1">
                    Including Qur'ans, Tafsir, Hadith, Duas, and Educational Materials
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Divisions */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green text-center mb-12">Our Divisions</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-naaz-cream p-8 rounded-lg shadow-lg">
                <Book className="text-naaz-gold mb-4" size={48} />
                <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-4">Naaz Book Depot</h3>
                <p className="text-gray-700 mb-4">
                  Our flagship division publishing authentic Islamic literature, Quran translations, 
                  Hadith collections, and educational materials in English, Arabic, Urdu, and Bengali. 
                  Specializing in commercial color printing services for Islamic institutions.
                </p>
                <Link to="/books" className="text-naaz-gold hover:text-naaz-green font-medium">
                  Explore Books →
                </Link>
              </div>
              
              <div className="bg-naaz-cream p-8 rounded-lg shadow-lg relative">
                <div className="absolute top-4 right-4 bg-naaz-gold text-white px-2 py-1 rounded text-xs">
                  Coming Soon
                </div>
                <div className="text-naaz-gold mb-4" style={{fontSize: '48px'}}>🌸</div>
                <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-4">Naaz Perfumes</h3>
                <p className="text-gray-700 mb-4">
                  Premium alcohol-free Islamic perfumes and attars, crafted with natural ingredients 
                  following traditional methods and Islamic principles.
                </p>
                <span className="text-gray-500">Launching Soon</span>
              </div>
              
              <div className="bg-naaz-cream p-8 rounded-lg shadow-lg relative">
                <div className="absolute top-4 right-4 bg-naaz-gold text-white px-2 py-1 rounded text-xs">
                  Coming Soon
                </div>
                <div className="text-naaz-gold mb-4" style={{fontSize: '48px'}}>🕌</div>
                <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-4">Naaz Essentials</h3>
                <p className="text-gray-700 mb-4">
                  Islamic lifestyle products including prayer rugs, tasbih, Islamic home decor, 
                  and essential items for Muslim households.
                </p>
                <span className="text-gray-500">Launching Soon</span>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default About;
