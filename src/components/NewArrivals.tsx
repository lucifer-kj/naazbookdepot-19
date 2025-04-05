
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';

const NewArrivals = () => {
  const newProducts = [
    {
      id: 1,
      name: "Riyad-us-Saliheen",
      category: "Books",
      price: 1250,
      rating: 5,
      image: "/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png",
      link: "/books/riyad-us-saliheen"
    },
    {
      id: 2,
      name: "Amber Oud Attar",
      category: "Perfumes",
      price: 850,
      rating: 4.5,
      image: "/lovable-uploads/35ff87ed-b986-45b1-9c00-555f9d78c627.png",
      link: "/perfumes/amber-oud-attar"
    },
    {
      id: 3,
      name: "Premium Prayer Mat",
      category: "Essentials",
      price: 950,
      rating: 4.5,
      image: "/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png",
      link: "/essentials/premium-prayer-mat"
    },
    {
      id: 4,
      name: "Sahih Al-Bukhari",
      category: "Books",
      price: 1450,
      rating: 5,
      image: "/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png",
      link: "/books/sahih-al-bukhari"
    }
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green mb-4">New Arrivals</h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            The latest additions to our carefully curated collection of Islamic literature, fragrances, and essentials.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {newProducts.map((product) => (
            <div key={product.id} className="product-card group">
              <div className="relative">
                <Link to={product.link}>
                  <div className="h-64 overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                <span className="absolute top-2 left-2 bg-naaz-gold text-naaz-green text-xs font-medium px-2 py-1 rounded">
                  New
                </span>
                <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md text-naaz-green hover:text-naaz-gold transition-colors">
                  <Heart size={18} />
                </button>
              </div>
              <div className="p-4">
                <Link to={product.link}>
                  <span className="text-xs text-gray-500">{product.category}</span>
                  <h3 className="text-lg font-playfair font-bold mb-1 text-naaz-green group-hover:text-naaz-gold transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center mb-2">
                  {[...Array(Math.floor(product.rating))].map((_, i) => (
                    <Star key={i} size={14} className="text-naaz-gold fill-naaz-gold" />
                  ))}
                  {product.rating % 1 !== 0 && (
                    <Star size={14} className="text-naaz-gold fill-naaz-gold" />
                  )}
                  {[...Array(5 - Math.ceil(product.rating))].map((_, i) => (
                    <Star key={i + Math.ceil(product.rating)} size={14} className="text-gray-300" />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-naaz-green font-semibold">₹{product.price.toFixed(2)}</span>
                  <button className="bg-naaz-green text-white p-2 rounded-full hover:bg-naaz-gold transition-colors">
                    <ShoppingCart size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/products" className="gold-button">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
