
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { Book, Award, Users, Heart, Calendar, MapPin, Phone, Mail } from 'lucide-react';

const About = () => {
  const milestones = [
    { year: '1967', event: 'Founded in Kolkata with a vision to spread Islamic knowledge' },
    { year: '1975', event: 'Expanded to include Urdu and Bengali Islamic literature' },
    { year: '1985', event: 'Established distribution network across Eastern India' },
    { year: '1995', event: 'Launched children\'s Islamic book series' },
    { year: '2005', event: 'Digitized catalog and modernized operations' },
    { year: '2015', event: 'Opened second location in Mumbai' },
    { year: '2020', event: 'Launched online presence during pandemic' },
    { year: '2024', event: 'Expanding into perfumes and lifestyle products' }
  ];

  const teamMembers = [
    {
      name: 'Haji Abdul Rahman',
      role: 'Founder & Chairman',
      description: 'Visionary leader who established Naaz with the mission of spreading authentic Islamic knowledge.',
      experience: '55+ years in Islamic publishing'
    },
    {
      name: 'Dr. Mohammed Farooq',
      role: 'Chief Editor',
      description: 'Islamic scholar and author, ensuring authenticity of all publications.',
      experience: 'PhD in Islamic Studies, 20+ years experience'
    },
    {
      name: 'Amina Khatun',
      role: 'Operations Manager',
      description: 'Overseeing daily operations and customer service with Islamic principles.',
      experience: '15+ years in book retail'
    },
    {
      name: 'Imam Syed Hassan',
      role: 'Religious Advisor',
      description: 'Guiding content selection and ensuring religious accuracy.',
      experience: 'Graduate of Al-Azhar University'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative h-96 overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.6)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-naaz-green/90 to-transparent" />
          <div className="relative container mx-auto h-full flex flex-col justify-center px-4">
            <h1 className="text-4xl md:text-6xl font-playfair font-bold text-white mb-4">About Naaz Group</h1>
            <p className="text-xl text-white/90 max-w-2xl font-arabic">
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
            </p>
            <p className="text-lg text-white/90 max-w-2xl mt-2">
              Publishing the Light of Knowledge since 1967
            </p>
          </div>
        </div>

        {/* Company Story */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green mb-6">Our Story</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Since 1967, Naaz Book Depot has been a beacon of authentic Islamic knowledge in Kolkata, West Bengal. 
                What began as a humble bookstore with a vision to make Islamic literature accessible to the Bengali-speaking 
                Muslim community has grown into one of Eastern India's most trusted publishers and distributors of Islamic books.
              </p>
              <div className="grid md:grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <Book className="text-naaz-gold mx-auto mb-4" size={48} />
                  <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-2">10,000+</h3>
                  <p className="text-gray-600">Books Published</p>
                </div>
                <div className="text-center">
                  <Users className="text-naaz-gold mx-auto mb-4" size={48} />
                  <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-2">500,000+</h3>
                  <p className="text-gray-600">Readers Served</p>
                </div>
                <div className="text-center">
                  <Award className="text-naaz-gold mx-auto mb-4" size={48} />
                  <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-2">55+</h3>
                  <p className="text-gray-600">Years of Trust</p>
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
                      <h3 className="font-semibold text-naaz-green mb-2">Authentic Knowledge</h3>
                      <p className="text-gray-700">We are committed to publishing only authentic Islamic literature, verified by qualified scholars.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Book className="text-naaz-gold mr-4 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h3 className="font-semibold text-naaz-green mb-2">Educational Excellence</h3>
                      <p className="text-gray-700">Making Islamic education accessible through quality publications in multiple languages.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users className="text-naaz-gold mr-4 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h3 className="font-semibold text-naaz-green mb-2">Community Service</h3>
                      <p className="text-gray-700">Serving the Muslim community with dedication, integrity, and Islamic principles.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-4">Islamic Business Principles</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-naaz-gold rounded-full mr-3"></span>
                    Honesty and transparency in all transactions
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-naaz-gold rounded-full mr-3"></span>
                    Fair pricing and ethical business practices
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-naaz-gold rounded-full mr-3"></span>
                    Respect for customers and community
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-naaz-gold rounded-full mr-3"></span>
                    Zakat and charitable contributions
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-naaz-gold rounded-full mr-3"></span>
                    Environmental responsibility
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green text-center mb-12">Our Journey</h2>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-20 text-right pr-4">
                      <span className="text-lg font-bold text-naaz-gold">{milestone.year}</span>
                    </div>
                    <div className="flex-shrink-0 w-4 h-4 bg-naaz-green rounded-full mt-1.5 relative">
                      {index < milestones.length - 1 && (
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-naaz-green/30"></div>
                      )}
                    </div>
                    <div className="flex-grow pl-4">
                      <p className="text-gray-700">{milestone.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Divisions */}
        <section className="py-16 px-4 bg-naaz-cream">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green text-center mb-12">Our Divisions</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <Book className="text-naaz-gold mb-4" size={48} />
                <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-4">Naaz Book Depot</h3>
                <p className="text-gray-700 mb-4">
                  Our flagship division publishing authentic Islamic literature, Quran translations, 
                  Hadith collections, and educational materials in English, Arabic, Urdu, and Bengali.
                </p>
                <Link to="/books" className="text-naaz-gold hover:text-naaz-green font-medium">
                  Explore Books →
                </Link>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-lg relative">
                <div className="absolute top-4 right-4 bg-naaz-gold text-white px-2 py-1 rounded text-xs">
                  Coming Soon
                </div>
                <div className="text-naaz-gold mb-4" style={{fontSize: '48px'}}>🌸</div>
                <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-4">Naaz Perfumes</h3>
                <p className="text-gray-700 mb-4">
                  Premium alcohol-free Islamic perfumes and attars, crafted with natural ingredients 
                  following traditional methods and Islamic principles.
                </p>
                <span className="text-gray-500">Launching 2024</span>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-lg relative">
                <div className="absolute top-4 right-4 bg-naaz-gold text-white px-2 py-1 rounded text-xs">
                  Coming Soon
                </div>
                <div className="text-naaz-gold mb-4" style={{fontSize: '48px'}}>🕌</div>
                <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-4">Naaz Essentials</h3>
                <p className="text-gray-700 mb-4">
                  Islamic lifestyle products including prayer rugs, tasbih, Islamic home decor, 
                  and essential items for Muslim households.
                </p>
                <span className="text-gray-500">Launching 2024</span>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green text-center mb-12">Meet Our Team</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="w-32 h-32 bg-naaz-cream rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="text-naaz-green" size={48} />
                  </div>
                  <h3 className="text-lg font-playfair font-semibold text-naaz-green mb-2">{member.name}</h3>
                  <p className="text-naaz-gold font-medium mb-2">{member.role}</p>
                  <p className="text-gray-700 text-sm mb-2">{member.description}</p>
                  <p className="text-xs text-gray-500">{member.experience}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 px-4 bg-naaz-green text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-playfair font-bold mb-4">Get in Touch</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Have questions about our books or services? We'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="bg-naaz-gold hover:bg-naaz-gold/90 text-white px-8 py-3 rounded-lg font-medium transition-colors">
                Contact Us
              </Link>
              <Link to="/books" className="border border-white hover:bg-white hover:text-naaz-green text-white px-8 py-3 rounded-lg font-medium transition-colors">
                Browse Books
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
