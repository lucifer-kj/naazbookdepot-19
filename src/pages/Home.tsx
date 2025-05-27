
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, ChevronDown, Star, ArrowRight, BookOpen, Heart, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  // State for rotating contact info
  const [currentInfo, setCurrentInfo] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentProduct, setCurrentProduct] = useState(0);

  const contactInfo = [
    { icon: <Phone size={14} />, text: '033 22350051' },
    { icon: <Phone size={14} />, text: '033 22350960' },
    { icon: <Phone size={14} />, text: '+91 91634 31395' },
    { icon: <Mail size={14} />, text: 'naazgroupofficial@gmail.com' }
  ];

  const featuredBooks = [
    {
      id: 1,
      title: "Sahih Al-Bukhari",
      author: "Imam Bukhari",
      price: "₹850",
      image: "/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png",
      rating: 5
    },
    {
      id: 2,
      title: "Tafseer Ibn Kathir",
      author: "Ibn Kathir",
      price: "₹1,200",
      image: "/lovable-uploads/35ff87ed-b986-45b1-9c00-555f9d78c627.png",
      rating: 5
    },
    {
      id: 3,
      title: "Riyadh as-Salihin",
      author: "Imam Nawawi",
      price: "₹650",
      image: "/lovable-uploads/62fd92cc-0660-4c44-a99d-c69c5be673cb.png",
      rating: 5
    }
  ];

  const testimonials = [
    {
      name: "Dr. Fatima Ahmed",
      location: "Kolkata",
      text: "Naaz Book Depot has been my trusted source for authentic Islamic literature for over 15 years. Their collection is unmatched.",
      rating: 5
    },
    {
      name: "Muhammad Hassan",
      location: "Delhi",
      text: "Excellent service and genuine books. The staff is very knowledgeable about Islamic literature.",
      rating: 5
    },
    {
      name: "Aisha Rahman",
      location: "Mumbai",
      text: "I've ordered multiple times and each book arrived in perfect condition. Highly recommended for serious Islamic studies.",
      rating: 5
    }
  ];

  // Infinite loop animation for contact info
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentInfo((prev) => (prev + 1) % contactInfo.length);
        setIsTransitioning(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Testimonials carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextProduct = () => {
    setCurrentProduct((prev) => (prev + 1) % featuredBooks.length);
  };

  const prevProduct = () => {
    setCurrentProduct((prev) => (prev - 1 + featuredBooks.length) % featuredBooks.length);
  };

  return (
    <div className="min-h-screen bg-naaz-cream">
      <Navbar />
      
      {/* Contact Info Strip */}
      <div className="bg-naaz-green text-white py-2 px-4">
        <div className="container mx-auto text-center">
          <div className={`flex items-center justify-center gap-2 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {contactInfo[currentInfo].icon}
            <span className="text-sm">{contactInfo[currentInfo].text}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-naaz-green"
          style={{
            backgroundImage: "url('/lovable-uploads/61ad7a88-c8e2-42f6-b3b1-567415b3c17e.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.7)',
          }}
        />

        {/* Glassmorphism Quranic Verse Overlay */}
        <div className="hidden lg:block absolute top-8 right-8 max-w-[300px] p-6 rounded-xl backdrop-blur-md bg-white/10 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.12)] text-right">
          <p className="font-arabic text-white text-xl leading-relaxed mb-4">
            اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ
            <br />
            خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ
            <br />
            اقْرَأْ وَرَبُّكَ الْأَكْرَمُ
            <br />
            الَّذِي عَلَّمَ بِالْقَلَمِ
            <br />
            عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ
          </p>
          <p className="text-white/80 text-sm italic leading-relaxed">
            "Read in the name of your Lord who created—
            Created man from a clot.
            Read, and your Lord is the Most Generous—
            Who taught by the pen—
            Taught man that which he knew not."
            <span className="block mt-1 text-white/60 text-xs">
              (Surah Al-'Alaq, 96:1–5)
            </span>
          </p>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-playfair font-bold text-white mb-4">
              Naaz Book Depot – Kolkata
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-6 font-playfair italic">
              "Publishing the Light of Knowledge"
            </p>
            <p className="text-lg text-white/90 mb-8">
              A pioneering publishing company since 1967, specializing in Islamic literature and the Qur'an in multiple languages.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/about" className="bg-naaz-gold text-naaz-green px-8 py-3 rounded-lg font-bold hover:bg-naaz-gold/90 transition-colors text-center">
                About Us
              </Link>
              <Link to="/contact" className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-naaz-green transition-colors text-center">
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce text-white">
          <ChevronDown size={32} />
        </div>
      </section>

      {/* Featured Products Carousel */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green text-center mb-12">
            Featured Islamic Books
          </h2>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="flex items-center justify-center">
              <button 
                onClick={prevProduct}
                className="absolute left-0 z-10 bg-naaz-green/80 text-white p-2 rounded-full hover:bg-naaz-green transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full px-12">
                {featuredBooks.map((book, index) => (
                  <div 
                    key={book.id}
                    className={`bg-white rounded-lg shadow-md p-6 text-center transition-all duration-500 ${
                      index === currentProduct ? 'transform scale-105 shadow-lg' : ''
                    }`}
                  >
                    <img 
                      src={book.image} 
                      alt={book.title}
                      className="w-32 h-40 object-cover mx-auto mb-4 rounded"
                    />
                    <h3 className="font-playfair font-semibold text-naaz-green mb-2">{book.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                    <div className="flex justify-center mb-2">
                      {[...Array(book.rating)].map((_, i) => (
                        <Star key={i} size={16} className="text-naaz-gold fill-current" />
                      ))}
                    </div>
                    <p className="text-naaz-green font-bold text-lg mb-4">{book.price}</p>
                    <button className="bg-naaz-green text-white px-4 py-2 rounded hover:bg-naaz-green/90 transition-colors">
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={nextProduct}
                className="absolute right-0 z-10 bg-naaz-green/80 text-white p-2 rounded-full hover:bg-naaz-green transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </div>
            
            <div className="text-center mt-8">
              <Link 
                to="/books" 
                className="bg-naaz-gold text-white px-6 py-3 rounded-lg font-semibold hover:bg-naaz-gold/90 transition-colors inline-flex items-center gap-2"
              >
                View All Books <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Three Divisions Showcase */}
      <section className="py-16 px-4 bg-naaz-cream">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green text-center mb-12">
            Our Three Divisions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Books Division */}
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-naaz-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-naaz-green" size={32} />
              </div>
              <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-3">
                Naaz Books
              </h3>
              <p className="text-gray-600 mb-4">
                Extensive collection of Islamic literature, Quran, Hadith, and scholarly works in multiple languages.
              </p>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                Available Now
              </div>
              <Link 
                to="/books" 
                className="text-naaz-gold hover:text-naaz-green font-semibold transition-colors"
              >
                Browse Collection →
              </Link>
            </div>

            {/* Perfumes Division */}
            <div className="bg-white rounded-lg shadow-md p-8 text-center opacity-60">
              <div className="w-16 h-16 bg-naaz-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-naaz-green" size={32} />
              </div>
              <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-3">
                Naaz Perfumes
              </h3>
              <p className="text-gray-600 mb-4">
                Premium collection of alcohol-free Islamic fragrances and traditional attars.
              </p>
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                Coming Soon
              </div>
              <span className="text-gray-400 font-semibold">
                Stay Tuned
              </span>
            </div>

            {/* Essentials Division */}
            <div className="bg-white rounded-lg shadow-md p-8 text-center opacity-60">
              <div className="w-16 h-16 bg-naaz-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-naaz-green" size={32} />
              </div>
              <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-3">
                Naaz Essentials
              </h3>
              <p className="text-gray-600 mb-4">
                Prayer rugs, tasbeeh, Islamic art, and essential items for spiritual practice.
              </p>
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                Coming Soon
              </div>
              <span className="text-gray-400 font-semibold">
                Stay Tuned
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section Preview */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green mb-6">
                A Legacy of Knowledge Since 1967
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Founded in the heart of Kolkata, Naaz Book Depot has been a beacon of Islamic knowledge 
                for over five decades. Our journey began with a simple mission: to make authentic Islamic 
                literature accessible to every seeker of knowledge.
              </p>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Today, we continue this tradition by expanding our offerings while maintaining our 
                commitment to authenticity and quality in Islamic education.
              </p>
              <Link 
                to="/about" 
                className="bg-naaz-gold text-white px-6 py-3 rounded-lg font-semibold hover:bg-naaz-gold/90 transition-colors inline-flex items-center gap-2"
              >
                Learn More About Us <ArrowRight size={20} />
              </Link>
            </div>
            
            <div className="bg-naaz-cream p-8 rounded-lg">
              <h3 className="text-xl font-playfair font-semibold text-naaz-green mb-6">
                Key Milestones
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="text-naaz-gold mr-3 font-bold">1967</span>
                  <span className="text-gray-700">Founded in Kolkata as a small Islamic bookstore</span>
                </div>
                <div className="flex items-start">
                  <span className="text-naaz-gold mr-3 font-bold">1980s</span>
                  <span className="text-gray-700">Became a leading distributor of Islamic literature in Bengal</span>
                </div>
                <div className="flex items-start">
                  <span className="text-naaz-gold mr-3 font-bold">2000s</span>
                  <span className="text-gray-700">Expanded to serve customers across India</span>
                </div>
                <div className="flex items-start">
                  <span className="text-naaz-gold mr-3 font-bold">2024</span>
                  <span className="text-gray-700">Launched online platform for global reach</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-naaz-cream">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green text-center mb-12">
            What Our Customers Say
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} size={20} className="text-naaz-gold fill-current" />
                ))}
              </div>
              <p className="text-gray-700 text-lg italic mb-6 leading-relaxed">
                "{testimonials[currentTestimonial].text}"
              </p>
              <div>
                <h4 className="font-semibold text-naaz-green">{testimonials[currentTestimonial].name}</h4>
                <p className="text-gray-600 text-sm">{testimonials[currentTestimonial].location}</p>
              </div>
            </div>
            
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-naaz-gold' : 'bg-gray-300'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 px-4 bg-naaz-green text-white">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-6">
              Stay Connected with Islamic Knowledge
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join our community and receive updates on new Islamic books, scholarly articles, and spiritual guidance.
            </p>
            <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
              <input
                type="email"
                placeholder="Enter your email for blessed updates"
                className="flex-1 px-4 py-3 rounded-lg text-gray-800 outline-none"
              />
              <button className="bg-naaz-gold hover:bg-naaz-gold/90 text-naaz-green px-6 py-3 rounded-lg font-bold transition-colors">
                Subscribe
              </button>
            </div>
            <p className="text-white/70 text-sm mt-4">
              "And whoever seeks knowledge, Allah will make the path to Paradise easy for him" - Prophet Muhammad (PBUH)
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
