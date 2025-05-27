
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
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
  );
};

export default TestimonialsSection;
