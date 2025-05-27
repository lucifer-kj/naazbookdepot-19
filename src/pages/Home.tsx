import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, ChevronDown, Star, ArrowRight, BookOpen, Heart, Sparkles, ChevronLeft, ChevronRight, MessageCircle, ArrowUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentProduct, setCurrentProduct] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  
  const fullTypewriterText = "Publishing the Light of Knowledge since 1967";
  
  const contactInfo = [
    { icon: <Phone size={14} />, text: '033 22350051' },
    { icon: <Phone size={14} />, text: '033 22350960' },
    { icon: <Phone size={14} />, text: '+91 91634 31395' },
    { icon: <Mail size={14} />, text: 'naazgroupofficial@gmail.com' },
    { icon: <Mail size={14} />, text: 'Visit us in Kolkata, West Bengal' }
  ];

  const featuredBooks = [{
    id: 1,
    title: "Sahih Al-Bukhari",
    author: "Imam Bukhari",
    price: "₹850",
    image: "/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png",
    rating: 5,
    description: "Authentic collection of Prophet's sayings"
  }, {
    id: 2,
    title: "Tafseer Ibn Kathir",
    author: "Ibn Kathir",
    price: "₹1,200",
    image: "/lovable-uploads/35ff87ed-b986-45b1-9c00-555f9d78c627.png",
    rating: 5,
    description: "Comprehensive Quranic commentary"
  }, {
    id: 3,
    title: "Riyadh as-Salihin",
    author: "Imam Nawawi",
    price: "₹650",
    image: "/lovable-uploads/62fd92cc-0660-4c44-a99d-c69c5be673cb.png",
    rating: 5,
    description: "Gardens of the righteous collection"
  }];

  const testimonials = [{
    name: "Dr. Fatima Ahmed",
    location: "Kolkata",
    text: "Naaz Book Depot has been my trusted source for authentic Islamic literature for over 15 years. Their collection is unmatched and service exceptional.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=100&h=100&fit=crop&crop=face"
  }, {
    name: "Muhammad Hassan",
    location: "Delhi",
    text: "Excellent service and genuine books. The staff is very knowledgeable about Islamic literature and always helpful in recommendations.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
  }, {
    name: "Aisha Rahman",
    location: "Mumbai",
    text: "I've ordered multiple times and each book arrived in perfect condition. Their authenticity and quick delivery is commendable.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
  }];

  // Typewriter effect
  useEffect(() => {
    if (typewriterIndex < fullTypewriterText.length) {
      const timer = setTimeout(() => {
        setTypewriterText(prev => prev + fullTypewriterText[typewriterIndex]);
        setTypewriterIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [typewriterIndex]);

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);

      // Animate elements on scroll
      const elements = document.querySelectorAll('.scroll-animate');
      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('animate-fade-in');
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Testimonials carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextProduct = () => {
    setCurrentProduct(prev => (prev + 1) % featuredBooks.length);
  };
  
  const prevProduct = () => {
    setCurrentProduct(prev => (prev - 1 + featuredBooks.length) % featuredBooks.length);
  };
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <div className="min-h-screen bg-naaz-cream">
        <Navbar />
        
        {/* Horizontal Scrolling Contact Info Strip - Fixed Animation */}
        <div className="bg-naaz-green text-white py-2 px-4 relative overflow-hidden">
          <div className="animate-scroll">
            {/* First set of contact info */}
            {contactInfo.map((info, index) => (
              <div key={`first-${index}`} className="flex items-center gap-2 mx-8 whitespace-nowrap">
                <span className="animate-pulse">{info.icon}</span>
                <span className="text-sm font-medium">{info.text}</span>
              </div>
            ))}
            {/* Second set for seamless loop */}
            {contactInfo.map((info, index) => (
              <div key={`second-${index}`} className="flex items-center gap-2 mx-8 whitespace-nowrap">
                <span className="animate-pulse">{info.icon}</span>
                <span className="text-sm font-medium">{info.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Section - Increased Height */}
        <section className="relative h-[74vh] overflow-hidden">
          {/* Background with parallax effect */}
          <div 
            className="absolute inset-0 bg-naaz-green transform scale-110 transition-transform duration-1000" 
            style={{
              backgroundImage: "url('/lovable-uploads/61ad7a88-c8e2-42f6-b3b1-567415b3c17e.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed'
            }} 
          />
          
          {/* Semi-transparent overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-br from-naaz-green/80 via-naaz-green/60 to-naaz-green/80"></div>

          {/* Enhanced Glassmorphism Quranic Verse Overlay */}
          <div className="hidden lg:block absolute top-8 right-8 max-w-[350px] p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] text-right transform hover:scale-105 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
            <div className="relative z-10">
              <p className="font-arabic text-white text-xl leading-relaxed mb-4 drop-shadow-lg">
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
              <p className="text-white/90 text-sm italic leading-relaxed">
                "Read in the name of your Lord who created—
                Created man from a clot.
                Read, and your Lord is the Most Generous—
                Who taught by the pen—
                Taught man that which he knew not."
                <span className="block mt-2 text-white/70 text-xs font-semibold">
                  (Surah Al-'Alaq, 96:1–5)
                </span>
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-playfair font-bold text-white mb-6 animate-fade-in transform translate-x-0 opacity-100 transition-all duration-1000 drop-shadow-2xl">
                Naaz Book Depot
              </h1>
              
              {/* Typewriter effect */}
              <div className="mb-8">
                <p className="text-xl md:text-2xl text-white/95 font-playfair italic min-h-[2.5rem]">
                  "{typewriterText}"
                  <span className="animate-pulse ml-1 text-naaz-gold">|</span>
                </p>
              </div>
              
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-2xl">
                A pioneering publishing company since 1967, specializing in authentic Islamic literature 
                and the Qur'an in multiple languages, serving the global Muslim community.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
                <Link to="/about" className="group bg-naaz-gold text-naaz-green px-8 py-4 rounded-xl font-bold hover:bg-naaz-gold/90 transition-all duration-300 text-center transform hover:scale-105 hover:shadow-2xl">
                  <span className="flex items-center justify-center gap-2">
                    Discover Our Legacy
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <Link to="/books" className="group border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-naaz-green transition-all duration-300 text-center transform hover:scale-105">
                  <span className="flex items-center justify-center gap-2">
                    Explore Books
                    <BookOpen size={20} className="group-hover:rotate-12 transition-transform" />
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce text-white">
            <div className="flex flex-col items-center">
              <span className="text-sm mb-2 opacity-80">Scroll to explore</span>
              <ChevronDown size={32} />
            </div>
          </div>
        </section>

        {/* Featured Products Carousel */}
        <section className="py-20 px-4 bg-gradient-to-b from-white to-naaz-cream/50 scroll-animate opacity-0">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-playfair font-bold text-naaz-green mb-4">
                Featured Islamic Books
              </h2>
              <div className="w-24 h-1 bg-naaz-gold mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover our carefully curated collection of authentic Islamic literature
              </p>
            </div>
            
            <div className="relative max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-12">
                {featuredBooks.map((book, index) => (
                  <div key={book.id} className={`group bg-white rounded-2xl shadow-lg p-6 text-center transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${index === currentProduct ? 'ring-2 ring-naaz-gold transform scale-105' : ''}`}>
                    <div className="relative overflow-hidden rounded-xl mb-6">
                      <img src={book.image} alt={book.title} className="w-40 h-48 object-cover mx-auto transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-naaz-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    
                    <h3 className="font-playfair font-semibold text-xl text-naaz-green mb-2 group-hover:text-naaz-gold transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                    <p className="text-gray-500 text-xs mb-3">{book.description}</p>
                    
                    <div className="flex justify-center mb-3">
                      {[...Array(book.rating)].map((_, i) => (
                        <Star key={i} size={16} className="text-naaz-gold fill-current" />
                      ))}
                    </div>
                    
                    <p className="text-naaz-green font-bold text-xl mb-4">{book.price}</p>
                    
                    <div className="flex gap-2">
                      <button className="flex-1 bg-naaz-green text-white px-4 py-2 rounded-lg hover:bg-naaz-green/90 transition-all duration-300 transform hover:scale-105">
                        Add to Cart
                      </button>
                      <button className="px-4 py-2 border border-naaz-green text-naaz-green rounded-lg hover:bg-naaz-green hover:text-white transition-all duration-300">
                        Quick View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Navigation buttons for mobile */}
              <div className="flex justify-center mt-8 md:hidden gap-4">
                <button onClick={prevProduct} className="bg-naaz-green/80 text-white p-3 rounded-full hover:bg-naaz-green transition-colors">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={nextProduct} className="bg-naaz-green/80 text-white p-3 rounded-full hover:bg-naaz-green transition-colors">
                  <ChevronRight size={24} />
                </button>
              </div>
              
              <div className="text-center mt-12">
                <Link to="/books" className="group bg-naaz-gold text-white px-8 py-4 rounded-xl font-semibold hover:bg-naaz-gold/90 transition-all duration-300 inline-flex items-center gap-3 transform hover:scale-105">
                  View Complete Collection 
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Three Divisions Showcase */}
        <section className="py-20 px-4 bg-gradient-to-b from-naaz-cream/50 to-white scroll-animate opacity-0">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-playfair font-bold text-naaz-green mb-4">
                Our Three Divisions
              </h2>
              <div className="w-24 h-1 bg-naaz-gold mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Expanding our reach to serve the complete spiritual and lifestyle needs of the Muslim community
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Books Division */}
              <div className="group bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className="w-20 h-20 bg-gradient-to-br from-naaz-green to-naaz-green/80 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="text-white" size={36} />
                </div>
                <h3 className="text-2xl font-playfair font-semibold text-naaz-green mb-4 group-hover:text-naaz-gold transition-colors">
                  Naaz Books
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Extensive collection of Islamic literature, Quran, Hadith, and scholarly works in multiple languages.
                </p>
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6 inline-block">
                  Available Now
                </div>
                <Link to="/books" className="group-hover:bg-naaz-green group-hover:text-white text-naaz-gold border border-naaz-gold px-6 py-3 rounded-xl font-semibold transition-all duration-300 inline-flex items-center gap-2">
                  Browse Collection 
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Perfumes Division */}
              <div className="group bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-naaz-gold text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                  Coming Soon
                </div>
                <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="text-white" size={36} />
                </div>
                <h3 className="text-2xl font-playfair font-semibold text-naaz-green mb-4">
                  Naaz Perfumes
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Premium collection of alcohol-free Islamic fragrances and traditional attars.
                </p>
                <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-6 inline-block">
                  Launch: Early 2025
                </div>
                <Link to="/perfumes" className="text-gray-500 border border-gray-300 px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-gray-50 transition-all duration-300">
                  Get Notified
                  <Mail size={18} />
                </Link>
              </div>

              {/* Essentials Division */}
              <div className="group bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-naaz-gold text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                  Coming Soon
                </div>
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="text-white" size={36} />
                </div>
                <h3 className="text-2xl font-playfair font-semibold text-naaz-green mb-4">
                  Naaz Essentials
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Prayer rugs, tasbeeh, Islamic art, and essential items for spiritual practice.
                </p>
                <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-6 inline-block">
                  Launch: Mid 2025
                </div>
                <Link to="/essentials" className="text-gray-500 border border-gray-300 px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-gray-50 transition-all duration-300">
                  Stay Updated
                  <Mail size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* About Section Preview */}
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

        {/* Enhanced Testimonials Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-naaz-cream/30 to-naaz-green/5 scroll-animate opacity-0">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-playfair font-bold text-naaz-green mb-4">
                What Our Customers Say
              </h2>
              <div className="w-24 h-1 bg-naaz-gold mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Trusted by thousands of readers across the globe
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-naaz-green via-naaz-gold to-naaz-green"></div>
                
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} size={24} className="text-naaz-gold fill-current mx-0.5" />
                  ))}
                </div>
                
                <p className="text-gray-700 text-xl italic mb-8 leading-relaxed">
                  "{testimonials[currentTestimonial].text}"
                </p>
                
                <div className="flex items-center justify-center">
                  <img 
                    src={testimonials[currentTestimonial].image} 
                    alt={testimonials[currentTestimonial].name} 
                    className="w-16 h-16 rounded-full mr-4 border-2 border-naaz-gold" 
                  />
                  <div>
                    <h4 className="font-semibold text-naaz-green text-lg">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-gray-600">{testimonials[currentTestimonial].location}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center mt-8 space-x-3">
                {testimonials.map((_, index) => (
                  <button 
                    key={index} 
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? 'bg-naaz-gold scale-125' : 'bg-gray-300 hover:bg-naaz-gold/50'
                    }`}
                    onClick={() => setCurrentTestimonial(index)} 
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Newsletter Signup */}
        <section className="py-20 px-4 bg-gradient-to-br from-naaz-green to-naaz-green/90 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20v20h20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          
          <div className="container mx-auto text-center relative z-10">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-6">
                Stay Connected with Islamic Knowledge
              </h2>
              <div className="w-24 h-1 bg-naaz-gold mx-auto mb-8"></div>
              <p className="text-xl mb-12 text-white/90 leading-relaxed">
                Join our community and receive updates on new Islamic books, scholarly articles, and spiritual guidance.
              </p>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
                  <input 
                    type="email" 
                    placeholder="Enter your email for blessed updates" 
                    className="flex-1 px-6 py-4 rounded-xl text-gray-800 outline-none focus:ring-2 focus:ring-naaz-gold transition-all" 
                  />
                  <button className="bg-naaz-gold hover:bg-naaz-gold/90 text-naaz-green px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105">
                    Subscribe
                  </button>
                </div>
                
                <p className="text-white/80 text-sm mt-6 italic">
                  "And whoever seeks knowledge, Allah will make the path to Paradise easy for him" - Prophet Muhammad (PBUH)
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Floating WhatsApp Button */}
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
          <a 
            href="https://wa.me/919163431395" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-300 animate-pulse"
          >
            <MessageCircle size={24} />
          </a>
        </div>

        {/* Back to Top Button */}
        {showBackToTop && (
          <button 
            onClick={scrollToTop} 
            className="fixed bottom-6 left-6 bg-naaz-gold hover:bg-naaz-gold/90 text-white p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-300 z-50"
          >
            <ArrowUp size={20} />
          </button>
        )}

        <Footer />
      </div>
    </>
  );
};

export default Home;
