
import React, { useState } from 'react';
import { Sparkles, Bell, ArrowRight, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface ComingSoonProps {
  section: 'perfumes' | 'essentials';
}

const ComingSoon: React.FC<ComingSoonProps> = ({ section }) => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const sectionData = {
    perfumes: {
      title: 'Naaz Perfumes',
      subtitle: 'Halal Fragrances Collection',
      description: 'Experience the art of Islamic perfumery with our carefully curated collection of alcohol-free, halal fragrances inspired by traditional Islamic scents and modern elegance.',
      image: '/lovable-uploads/a8c77a1e-70d0-4c8f-8218-bbff0885a682.png',
      features: [
        'Alcohol-free, halal certified fragrances',
        'Traditional oud and musk collections',
        'Modern floral and citrus blends',
        'Premium quality oils and attars',
        'Islamic-inspired packaging'
      ],
      launchDate: 'March 2024',
      colors: {
        primary: 'from-purple-600 to-pink-600',
        accent: 'purple-600',
        light: 'purple-50'
      }
    },
    essentials: {
      title: 'Naaz Essentials',
      subtitle: 'Islamic Lifestyle Products',
      description: 'Discover a comprehensive collection of Islamic lifestyle essentials including prayer accessories, home decor, wellness products, and daily life items that align with Islamic values.',
      image: '/placeholder.svg',
      features: [
        'Prayer mats and Islamic home decor',
        'Natural wellness and skincare products',
        'Islamic art and calligraphy items',
        'Traditional Islamic clothing accessories',
        'Halal lifestyle products'
      ],
      launchDate: 'April 2024',
      colors: {
        primary: 'from-emerald-600 to-teal-600',
        accent: 'emerald-600',
        light: 'emerald-50'
      }
    }
  };

  const data = sectionData[section];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <div className={`bg-gradient-to-br ${data.colors.primary} text-white py-20 px-4`}>
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-center mb-6">
                <Sparkles size={32} className="mr-3" />
                <span className="text-lg font-medium">Coming Soon</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-playfair font-bold mb-4">
                {data.title}
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-6">
                {data.subtitle}
              </p>
              
              <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
                {data.description}
              </p>
              
              <div className="flex items-center justify-center text-white/90 mb-8">
                <Calendar size={20} className="mr-2" />
                <span>Expected Launch: {data.launchDate}</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <img
                  src={data.image}
                  alt={data.title}
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-playfair font-bold text-naaz-green mb-6">
                  What to Expect
                </h2>
                
                <ul className="space-y-4">
                  {data.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className={`w-6 h-6 rounded-full bg-${data.colors.accent} flex items-center justify-center mr-3 mt-0.5`}>
                        <span className="text-white text-xs">✓</span>
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className={`mt-8 p-6 bg-${data.colors.light} rounded-lg`}>
                  <h3 className="font-playfair font-semibold text-naaz-green mb-2">
                    Islamic Values Promise
                  </h3>
                  <p className="text-gray-700 text-sm">
                    All our {section} are carefully selected and crafted to align with Islamic principles, 
                    ensuring halal compliance and cultural sensitivity in every product.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 px-4 bg-naaz-cream">
          <div className="container mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Bell size={48} className="mx-auto text-naaz-gold mb-6" />
              
              <h2 className="text-3xl font-playfair font-bold text-naaz-green mb-4">
                Be the First to Know
              </h2>
              
              <p className="text-gray-700 mb-8">
                Subscribe to receive exclusive updates, early access, and special launch offers 
                for {data.title}. Insha'Allah, we'll keep you informed about our progress.
              </p>
              
              {!isSubscribed ? (
                <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green"
                      required
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-naaz-green text-white rounded-lg hover:bg-naaz-green/90 transition-colors flex items-center"
                    >
                      Notify Me
                      <ArrowRight size={18} className="ml-2" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    We respect your privacy and will only send launch updates.
                  </p>
                </form>
              ) : (
                <div className="max-w-md mx-auto">
                  <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-4">
                    <p className="text-green-800 font-medium">
                      Alhamdulillah! You're on the list!
                    </p>
                    <p className="text-green-700 text-sm mt-1">
                      We'll notify you as soon as {data.title} launches.
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    "And whoever relies upon Allah - then He is sufficient for him. 
                    Indeed, Allah will accomplish His purpose." - Quran 65:3
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-playfair font-bold text-naaz-green text-center mb-12">
              Launch Timeline
            </h2>
            
            <div className="space-y-8">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-naaz-green text-white rounded-full flex items-center justify-center mr-6">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-naaz-green">Product Development</h3>
                  <p className="text-gray-600">Research, sourcing, and Islamic compliance verification - Completed</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-naaz-gold text-white rounded-full flex items-center justify-center mr-6">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-naaz-green">Quality Testing</h3>
                  <p className="text-gray-600">Rigorous testing and halal certification process - In Progress</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 text-white rounded-full flex items-center justify-center mr-6">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-gray-500">Website Integration</h3>
                  <p className="text-gray-500">Adding {section} section to our e-commerce platform - Upcoming</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 text-white rounded-full flex items-center justify-center mr-6">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-gray-500">Launch</h3>
                  <p className="text-gray-500">Official launch with exclusive offers for early subscribers</p>
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

export default ComingSoon;
