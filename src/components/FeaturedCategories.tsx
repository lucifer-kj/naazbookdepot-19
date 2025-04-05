
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, SprayCan, BookMarked } from 'lucide-react';

const FeaturedCategories = () => {
  const categories = [
    {
      id: 1,
      title: 'Naaz Book Depot',
      description: 'Premium collection of Islamic books and literature.',
      icon: <BookOpen size={40} className="text-naaz-gold mb-4" />,
      link: '/books',
      bgClass: 'bg-naaz-green',
    },
    {
      id: 2,
      title: 'Naaz Perfumes',
      description: 'Exquisite non-alcoholic attars and fragrances.',
      icon: <SprayCan size={40} className="text-naaz-gold mb-4" />,
      link: '/perfumes',
      bgClass: 'bg-naaz-burgundy',
    },
    {
      id: 3,
      title: 'Naaz Essentials',
      description: 'Quality Islamic accessories and essentials.',
      icon: <BookMarked size={40} className="text-naaz-gold mb-4" />,
      link: '/essentials',
      bgClass: 'bg-naaz-green',
    },
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green mb-4">Our Specialized Shops</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Discover our three specialized branches, each offering a unique collection of premium Islamic products.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link 
              to={category.link} 
              key={category.id}
              className={`${category.bgClass} rounded-lg p-8 text-white shadow-lg transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl`}
            >
              <div className="flex flex-col items-center text-center">
                {category.icon}
                <h3 className="text-xl font-playfair font-bold mb-2">{category.title}</h3>
                <p className="text-white/80">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
