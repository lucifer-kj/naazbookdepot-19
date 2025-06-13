
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, ShoppingCart } from 'lucide-react';
import { useCartContext } from '@/lib/context/CartContext';

const FeaturedBooksCarousel = () => {
  const [currentProduct, setCurrentProduct] = useState(0);
  const { addItem } = useCartContext();

  const featuredBooks = [{
    id: 1,
    title: "Sahih Al-Bukhari",
    author: "Imam Bukhari",
    price: "₹850",
    image: "/lovable-uploads/fb-1.jpg",
    rating: 5,
    description: "Authentic collection of Prophet's sayings"
  }, {
    id: 2,
    title: "Tafseer Ibn Kathir",
    author: "Ibn Kathir",
    price: "₹1,200",
    image: "/lovable-uploads/fb-2.jpeg",
    rating: 5,
    description: "Comprehensive Quranic commentary"
  }, {
    id: 3,
    title: "Riyadh as-Salihin",
    author: "Imam Nawawi",
    price: "₹650",
    image: "/lovable-uploads/fb-3.jpg",
    rating: 5,
    description: "Gardens of the righteous collection"
  }];

  const handleAddToCart = (book: typeof featuredBooks[0]) => {
    addItem({
      productId: book.id,
      name: book.title,
      price: book.price.replace('₹', ''),
      image: book.image
    });
  };

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-12">
            {featuredBooks.map((book, index) => (
              <div key={book.id} className={`group bg-white rounded-2xl shadow-lg p-6 text-center transition-all duration-500 hover:shadow-2xl hover:-translate-y-2`}>
                <Link to={`/product/${book.id}`} className="block">
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
                </Link>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAddToCart(book)}
                    className="flex-1 bg-naaz-green text-white px-4 py-2 rounded-lg hover:bg-naaz-green/90 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                  >
                    <ShoppingCart size={16} className="mr-1" />
                    Add to Cart
                  </button>
                  <Link 
                    to={`/product/${book.id}`}
                    className="px-4 py-2 border border-naaz-green text-naaz-green rounded-lg hover:bg-naaz-green hover:text-white transition-all duration-300 flex items-center justify-center"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/catalog" className="group bg-naaz-gold text-white px-8 py-4 rounded-xl font-semibold hover:bg-naaz-gold/90 transition-all duration-300 inline-flex items-center gap-3 transform hover:scale-105">
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
