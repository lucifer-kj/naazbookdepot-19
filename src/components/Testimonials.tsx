
import React from 'react';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Ahmed Khan',
      text: 'The quality of books from Naaz Book Depot is exceptional. Their collection of Islamic literature is the best in Kolkata.',
      stars: 5,
    },
    {
      id: 2,
      name: 'Fatima Rahman',
      text: 'Naaz Perfumes offers the most authentic non-alcoholic attars I've ever used. The fragrances last all day long.',
      stars: 5,
    },
    {
      id: 3,
      name: 'Mohammed Ali',
      text: 'I've been purchasing Islamic essentials from Naaz for years. Their prayer mats and accessories are top quality.',
      stars: 4,
    },
  ];

  return (
    <section className="py-16 px-4 geometric-pattern">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-white mb-4">What Our Customers Say</h2>
          <p className="text-white/80 max-w-2xl mx-auto">Hear from our satisfied customers across all three of our specialized shops.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex mb-4">
                {[...Array(testimonial.stars)].map((_, i) => (
                  <Star key={i} size={20} className="text-naaz-gold fill-naaz-gold" />
                ))}
                {[...Array(5 - testimonial.stars)].map((_, i) => (
                  <Star key={i + testimonial.stars} size={20} className="text-gray-300" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
              <p className="font-semibold text-naaz-green">— {testimonial.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
