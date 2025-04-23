
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Phone, Mail, Globe, Book, Info } from 'lucide-react';

const About = () => {
  const contacts = [
    { number: '+91 90510 85118', type: 'Mobile' },
    { number: '+91 91634 33935', type: 'Mobile' },
    { number: '033 2235 0051', type: 'Landline' },
    { number: '033 2235 0960', type: 'Landline' }
  ];

  const services = [
    'Printing and distribution of Qur'an and Islamic literature',
    'Commercial color printing services',
    'Educational books in Urdu, Bengali, Arabic, and more',
    'Collaborative printing projects with other publishers and businesses'
  ];

  const languages = ['Urdu', 'Bengali', 'Arabic', 'English'];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="About Us" 
        description="Established in 1967, Naaz Book Depot is a pioneering Islamic publishing company based in Kolkata, specializing in Islamic literature and the Qur'an in multiple languages."
      />
      <Navbar />
      <main className="flex-grow">
        {/* Hero Banner */}
        <div className="relative h-80 overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/lovable-uploads/a8c77a1e-70d0-4c8f-8218-bbff0885a682.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.7)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-naaz-green/80 to-transparent" />
          <div className="relative container mx-auto h-full flex flex-col justify-center px-4">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-white mb-4">About The Naaz Group</h1>
            <p className="text-white/90 max-w-xl text-lg">
              Over 55 years of heritage in Islamic publishing and knowledge dissemination
            </p>
          </div>
        </div>

        {/* Establishment & Mission */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl font-playfair font-bold text-naaz-green mb-6">Our Story</h2>
                <div className="prose prose-lg text-gray-700">
                  <p>
                    Naaz Book Depot came into existence in 1967. Based in Kolkata, West Bengal, 
                    we are a pioneering publishing company specializing in Islamic literature, 
                    particularly the Qur'an in multiple languages.
                  </p>
                  <p>
                    We cater to both online and offline printing and media needs, with a 
                    commitment to quality, authenticity, and accessibility.
                  </p>
                  <div className="mt-6 text-sm text-gray-500">
                    <p>Note: Not currently affiliated with naazbookdepot.</p>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="border-8 border-naaz-cream p-3 rounded-lg shadow-xl">
                  <img 
                    src="/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png" 
                    alt="Naaz Book Depot Historical Photo" 
                    className="rounded w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-5 -right-5 w-32 h-32 bg-naaz-gold rounded-full flex items-center justify-center text-center p-2">
                  <span className="text-naaz-green font-playfair font-bold text-lg">Since 1967</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Director's Note */}
        <section className="py-16 px-4 bg-naaz-cream/30">
          <div className="container mx-auto">
            <h2 className="text-3xl font-playfair font-bold text-naaz-green text-center mb-12">Director's Note</h2>
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-naaz-green rounded-full flex items-center justify-center">
                  <Info className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-naaz-green">MD IRFAN</h3>
                  <p className="text-gray-600">Director, Naaz Book Depot</p>
                </div>
              </div>
              <div className="prose prose-lg text-gray-700">
                <p>
                  Under the leadership of Md Irfan, Naaz Book Depot has flourished into a reputed 
                  name in the world of Islamic publishing. With over 2000 Islamic books and items 
                  published, including Qur'ans, Hadiths, Duas, and Athkar, his vision continues 
                  to guide the organization.
                </p>
                <blockquote className="border-l-4 border-naaz-gold pl-4 italic">
                  "Your dedication to publishing authentic Islamic literature is a source of 
                  immense benefit to the Ummah. May Allah bless your effort in spreading 
                  knowledge and making Islamic teachings accessible to all."
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-playfair font-bold text-naaz-green text-center mb-12">Our Services</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-naaz-green mb-6 flex items-center gap-2">
                  <Book className="w-6 h-6" />
                  Publishing Services
                </h3>
                <ul className="space-y-4">
                  {services.map((service, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-2 h-2 mt-2 bg-naaz-gold rounded-full flex-shrink-0" />
                      <span>{service}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-naaz-green mb-6 flex items-center gap-2">
                  <Globe className="w-6 h-6" />
                  Languages Offered
                </h3>
                <div className="flex flex-wrap gap-4">
                  {languages.map((language, index) => (
                    <span key={index} className="px-4 py-2 bg-naaz-cream rounded-full text-naaz-green">
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-16 px-4 bg-naaz-green text-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-playfair font-bold text-center mb-12">Get in Touch</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Phone className="w-6 h-6" /> Contact Numbers
                </h3>
                <ul className="space-y-2">
                  {contacts.map((contact, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <a href={`tel:${contact.number.replace(/\s/g, '')}`} className="hover:text-naaz-gold transition-colors">
                        {contact.number}
                      </a>
                      <span className="text-sm text-white/60">({contact.type})</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Mail className="w-6 h-6" /> Email & Website
                </h3>
                <a href="mailto:naazgroupofficial@gmail.com" className="block hover:text-naaz-gold transition-colors">
                  naazgroupofficial@gmail.com
                </a>
                <a href="https://www.naazbook.in" target="_blank" rel="noopener noreferrer" className="block hover:text-naaz-gold transition-colors">
                  www.naazbook.in
                </a>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Head Office</h3>
                <address className="not-italic">
                  1, Ismail Madani Lane<br />
                  Kolkata, West Bengal - 700073<br />
                  India
                </address>
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
