
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlist, useRemoveFromWishlist } from '@/lib/hooks/useWishlist';
import { useAddToCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const { data: wishlistItems = [], isLoading } = useWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();
  const { mutate: addToCart } = useAddToCart();

  const handleAddToCart = (item: any) => {
    addToCart({
      productId: item.products.id,
      quantity: 1
    });
  };

  const handleRemoveFromWishlist = (id: string) => {
    removeFromWishlist(id);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-16 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-naaz-green mb-4">Please Sign In</h2>
            <p className="text-gray-600 mb-6">You need to be signed in to view your wishlist.</p>
            <Link 
              to="/account"
              className="bg-naaz-green text-white px-6 py-2 rounded-lg hover:bg-naaz-green/90"
            >
              Sign In
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-naaz-green"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 px-4">
        <div className="container mx-auto">
          <motion.h1 
            className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Your Wishlist
          </motion.h1>
          
          {wishlistItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md p-4"
                >
                  <Link to={`/product/${item.products.id}`}>
                    <img
                      src={item.products.images?.[0] || '/placeholder.svg'}
                      alt={item.products.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="font-playfair font-semibold text-lg text-naaz-green mb-2">
                      {item.products.name}
                    </h3>
                    <p className="text-naaz-gold font-bold text-xl mb-4">
                      ₹{item.products.price}
                    </p>
                  </Link>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 bg-naaz-green text-white py-2 px-4 rounded hover:bg-naaz-green/90 transition-colors flex items-center justify-center"
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-xl font-playfair font-semibold text-naaz-green mb-4">
                Your wishlist is empty
              </h2>
              <p className="text-gray-600 mb-6">
                Start adding books you love to your wishlist!
              </p>
              <Link 
                to="/catalog"
                className="bg-naaz-green text-white px-6 py-3 rounded-lg hover:bg-naaz-green/90"
              >
                Browse Books
              </Link>
            </div>
          )}
          
          <motion.div 
            className="mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link to="/" className="flex items-center text-naaz-green hover:text-naaz-gold transition-colors">
              <ArrowLeft size={18} className="mr-2" />
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
