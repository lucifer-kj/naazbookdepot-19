
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCartContext } from '@/lib/context/CartContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Cart = () => {
  const { cart, updateQuantity, removeItem, clearCart } = useCartContext();

  // Calculate cart totals
  const subtotal = cart.subtotal;
  const shipping = cart.items.length > 0 ? 100 : 0;
  const total = subtotal + shipping;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

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
            Your Shopping Cart
          </motion.h1>
          
          {cart.items.length > 0 ? (
            <motion.div 
              className="grid lg:grid-cols-3 gap-10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-playfair font-semibold text-naaz-green">
                        Cart Items ({cart.totalItems})
                      </h2>
                      <motion.button 
                        className="text-naaz-burgundy hover:text-naaz-burgundy/80 flex items-center font-medium"
                        onClick={clearCart}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={cart.items.length === 0}
                      >
                        <Trash2 size={16} className="mr-1" />
                        Clear Cart
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {cart.items.map((item) => (
                      <motion.div 
                        key={`${item.productId}-${item.variationId || ''}`}
                        className="flex flex-col sm:flex-row gap-4 pb-6 border-b border-gray-200"
                        variants={itemVariants}
                      >
                        <div className="sm:w-24 h-24 bg-naaz-cream flex-shrink-0 rounded-md overflow-hidden">
                          <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <div>
                              <h3 className="text-lg font-playfair font-semibold text-naaz-green mb-1">{item.name}</h3>
                              {item.attributes?.map((attr, index) => (
                                <p key={index} className="text-sm text-gray-500">
                                  {attr.name}: {attr.value}
                                </p>
                              ))}
                            </div>
                            <div className="text-right sm:ml-4">
                              <p className="font-medium text-naaz-green">₹{Number(item.price).toLocaleString('en-IN')}</p>
                              <p className="text-sm text-gray-500">₹{Number(item.price).toLocaleString('en-IN')} each</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <motion.button 
                                className="px-3 py-1 hover:bg-gray-100 transition-colors"
                                onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variationId)}
                                whileTap={{ scale: 0.9 }}
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={16} />
                              </motion.button>
                              <span className="px-3 py-1 border-l border-r border-gray-300">
                                {item.quantity}
                              </span>
                              <motion.button 
                                className="px-3 py-1 hover:bg-gray-100 transition-colors"
                                onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variationId)}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Plus size={16} />
                              </motion.button>
                            </div>
                            <motion.button 
                              className="text-naaz-burgundy hover:text-naaz-burgundy/80 flex items-center"
                              onClick={() => removeItem(item.productId, item.variationId)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Trash2 size={16} className="mr-1" />
                              Remove
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Order Summary */}
              <motion.div 
                className="lg:col-span-1"
                variants={itemVariants}
              >
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                  <h2 className="text-xl font-playfair font-semibold text-naaz-green mb-6 pb-4 border-b border-gray-200">
                    Order Summary
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">₹{shipping.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-4 mt-4 border-t border-gray-200 flex justify-between">
                      <span className="text-gray-800 font-semibold">Total</span>
                      <span className="font-bold text-naaz-green">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link 
                      to="/checkout" 
                      className="gold-button w-full text-center mt-8 flex items-center justify-center"
                    >
                      <ShoppingBag size={18} className="mr-2" />
                      Proceed to Checkout
                    </Link>
                  </motion.div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium text-naaz-green mb-3">Accepted Payment Methods</h3>
                    <div className="flex space-x-3">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-8 w-auto" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-8 w-auto" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" alt="PayPal" className="h-8 w-auto" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              className="bg-white rounded-lg shadow-md p-10 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="flex justify-center mb-6"
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity, 
                  repeatType: "loop" 
                }}
              >
                <ShoppingBag size={64} className="text-naaz-green opacity-50" />
              </motion.div>
              <h2 className="text-2xl font-playfair font-semibold text-naaz-green mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/" className="gold-button inline-block">
                  Continue Shopping
                </Link>
              </motion.div>
            </motion.div>
          )}
          
          {/* Continue Shopping */}
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

export default Cart;
