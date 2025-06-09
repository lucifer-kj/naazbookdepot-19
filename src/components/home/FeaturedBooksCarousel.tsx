import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';

interface Book {
  id: number;
  name: string;
  author: string;
  description: string;
  price: string;
  rating: number;
  image: string;
}

interface FeaturedBooksCarouselProps {
  books: Book[];
}

const FeaturedBooksCarousel: React.FC<FeaturedBooksCarouselProps> = ({ books }) => {
  const navigate = useNavigate();

  const handleBookClick = (bookId: number) => {
    navigate(`/product/${bookId}`);
  };

  const handleQuickView = (e: React.MouseEvent, bookId: number) => {
    e.stopPropagation();
    // Handle quick view logic
  };

  const handleAddToCart = (e: React.MouseEvent, book: Book) => {
    e.stopPropagation();
    // Handle add to cart logic
  };

  // Prevent runtime error if books is undefined or null
  const safeBooks = Array.isArray(books) ? books : [];

  return (
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6 px-2 md:px-12">
            {safeBooks.map((book) => (
              <motion.div
                key={book.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer flex flex-col h-full"
                onClick={() => handleBookClick(book.id)}
              >
                <div className="relative aspect-[3/4] w-full">
                  <img
                    src={book.image}
                    alt={book.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col flex-1 p-4">
                  <h3 className="font-playfair font-semibold text-naaz-green hover:text-naaz-gold transition-colors">
                    {book.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                  <p className="text-gray-500 text-xs mb-3">{book.description}</p>
                  <div className="flex justify-center mb-3">
                    {[...Array(book.rating)].map((_, i) => (
                      <Star key={i} size={16} className="text-naaz-gold" fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-naaz-green font-bold text-xl mb-4">{book.price}</p>
                  <div className="flex gap-2 mt-auto">
                    <button 
                      type="button"
                      className="flex-1 bg-naaz-green text-white px-4 py-2 rounded-lg hover:bg-naaz-green/90 transition-all duration-300 transform hover:scale-105"
                      onClick={(e) => handleAddToCart(e, book)}
                    >
                      Add to Cart
                    </button>
                    <button 
                      type="button"
                      className="px-4 py-2 border border-naaz-green text-naaz-green rounded-lg hover:bg-naaz-green hover:text-white transition-all duration-300"
                      onClick={(e) => handleQuickView(e, book.id)}
                    >
                      Quick View
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
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
  );
};

export default FeaturedBooksCarousel;
