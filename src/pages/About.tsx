import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Users, Award, Heart, Globe } from 'lucide-react';

const About = () => {
  const stats = [
    { number: '10+', label: 'Years of Excellence' },
    { number: '50K+', label: 'Happy Customers' },
    { number: '1000+', label: 'Books Available' },
    { number: '24/7', label: 'Customer Support' }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8 text-naaz-green" />,
      title: 'Quality First',
      description: 'We carefully curate every book to ensure the highest quality content for our readers.'
    },
    {
      icon: <Users className="w-8 h-8 text-naaz-green" />,
      title: 'Community Focused',
      description: 'Building a community of knowledge seekers and lifelong learners across the globe.'
    },
    {
      icon: <Award className="w-8 h-8 text-naaz-green" />,
      title: 'Excellence',
      description: 'Committed to excellence in every aspect of our service and customer experience.'
    },
    {
      icon: <Globe className="w-8 h-8 text-naaz-green" />,
      title: 'Global Reach',
      description: 'Serving customers worldwide with fast shipping and reliable service.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-naaz-green to-green-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">About Naaz Group</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Your trusted partner in knowledge and learning since 2014
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Founded in 2014, Naaz Group began as a small bookstore with a big dream - to make quality books accessible to everyone. What started as a passion project has grown into a trusted name in the book industry.
              </p>
              <p className="text-gray-600 mb-4">
                We specialize in educational books, literature, and professional development materials. Our commitment to quality and customer satisfaction has helped us build lasting relationships with readers, students, and professionals worldwide.
              </p>
              <p className="text-gray-600">
                Today, we continue to expand our collection and improve our services, always keeping our customers' needs at the heart of everything we do.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80" 
                alt="Bookstore interior" 
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-naaz-green mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and help us serve our customers better every day.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tribute to MD Irfan Section */}
      <section className="bg-gradient-to-b from-gray-50 to-naaz-cream/30 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-naaz-green mb-6">
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

      {/* Contact CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Have questions about our books or services? We'd love to hear from you.
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <a 
              href="/contact" 
              className="inline-block bg-naaz-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              Contact Us
            </a>
            <a 
              href="/products" 
              className="inline-block border border-naaz-green text-naaz-green px-8 py-3 rounded-lg font-semibold hover:bg-naaz-green hover:text-white transition-colors"
            >
              Browse Books
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;