
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, Filter, ShoppingCart, Heart } from 'lucide-react';

const Books = () => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Books' },
    { id: 'quran', name: 'Quran & Tafsir' },
    { id: 'hadith', name: 'Hadith' },
    { id: 'fiqh', name: 'Fiqh' },
    { id: 'seerah', name: 'Seerah & Biography' },
    { id: 'history', name: 'Islamic History' },
    { id: 'spirituality', name: 'Spirituality' }
  ];

  const books = [
    {
      id: 1,
      name: 'The Noble Quran',
      price: 1200,
      category: 'quran',
      image: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png',
      bestseller: true
    },
    {
      id: 2,
      name: 'Sahih Al-Bukhari',
      price: 1450,
      category: 'hadith',
      image: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png',
      bestseller: false
    },
    {
      id: 3,
      name: 'Riyad-us-Saliheen',
      price: 950,
      category: 'hadith',
      image: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png',
      bestseller: true
    },
    {
      id: 4,
      name: 'The Sealed Nectar',
      price: 850,
      category: 'seerah',
      image: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png',
      bestseller: false
    },
    {
      id: 5,
      name: 'Tafsir Ibn Kathir',
      price: 1500,
      category: 'quran',
      image: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png',
      bestseller: false
    },
    {
      id: 6,
      name: 'Fiqh Made Easy',
      price: 750,
      category: 'fiqh',
      image: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png',
      bestseller: false
    }
  ];

  const filteredBooks = activeCategory === 'all' 
    ? books 
    : books.filter(book => book.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Banner */}
        <div className="relative h-80 overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.6)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-naaz-green/80 to-transparent" />
          <div className="relative container mx-auto h-full flex flex-col justify-center px-4">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-white mb-4">Islamic Books</h1>
            <p className="text-white/90 max-w-xl text-lg mb-6">
              Discover our extensive collection of authentic Islamic literature curated for spiritual growth and enlightenment.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto py-12 px-4">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10">
            <div className="relative w-full md:w-1/3 mb-4 md:mb-0">
              <input 
                type="text" 
                placeholder="Search books..." 
                className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-naaz-green"
              />
              <Search size={18} className="absolute top-1/2 transform -translate-y-1/2 right-4 text-gray-500" />
            </div>
            <button className="flex items-center bg-naaz-cream px-4 py-2 rounded-full text-naaz-green hover:bg-naaz-cream/80 transition-colors">
              <Filter size={18} className="mr-2" />
              Filter & Sort
            </button>
          </div>

          {/* Categories */}
          <div className="mb-10 overflow-x-auto scrollbar-hide">
            <div className="flex space-x-4 min-w-max pb-2">
              {categories.map(category => (
                <button 
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-5 py-2 rounded-full transition-colors whitespace-nowrap ${
                    activeCategory === category.id 
                      ? 'bg-naaz-green text-white' 
                      : 'bg-naaz-cream hover:bg-naaz-green/10 text-naaz-green'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredBooks.map(book => (
              <div key={book.id} className="product-card group">
                <div className="relative">
                  <div className="h-64 overflow-hidden">
                    <img 
                      src={book.image} 
                      alt={book.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {book.bestseller && (
                    <span className="absolute top-2 left-2 bg-naaz-burgundy text-white text-xs font-medium px-2 py-1 rounded">
                      Bestseller
                    </span>
                  )}
                  <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md text-naaz-green hover:text-naaz-gold transition-colors">
                    <Heart size={18} />
                  </button>
                </div>
                <div className="p-4">
                  <span className="text-xs text-gray-500 capitalize">{book.category}</span>
                  <h3 className="text-lg font-playfair font-bold mb-1 text-naaz-green group-hover:text-naaz-gold transition-colors">
                    {book.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-naaz-green font-semibold">₹{book.price.toFixed(2)}</span>
                    <button className="bg-naaz-green text-white p-2 rounded-full hover:bg-naaz-gold transition-colors">
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Books;
