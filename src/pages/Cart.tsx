import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartContext } from '@/lib/context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartEmpty from '@/components/cart/CartEmpty';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';

const shippingOptions = [
  {
    id: 'free',
    name: 'In Store Pickup',
    description: 'Available at our store',
    price: 0,
    time: '1-2 business days',
  },
  {
    id: 'standard',
    name: 'Standard Shipping',
    description: 'Delivery across India',
    price: 100,
    time: '5-7 business days',
  },
  {
    id: 'express',
    name: 'Express Shipping',
    description: 'Fast delivery service',
    price: 200,
    time: '2-3 business days',
  }
];

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeItem, clearCart } = useCartContext();
  const [selectedShipping, setSelectedShipping] = useState('standard');

  // Calculate cart totals
  const subtotal = cart.subtotal;
  const shipping = shippingOptions.find(option => option.id === selectedShipping)?.price || 0;
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
              <div className="lg:col-span-2 space-y-6">
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
                      <CartItem
                        key={`${item.productId}-${item.variationId || ''}`}
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeItem}
                      />
                    ))}
                  </div>
                </div>

                {/* Shipping Method Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Package className="text-naaz-green" size={24} />
                    <h2 className="text-xl font-playfair font-semibold text-naaz-green">
                      Shipping Method
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {shippingOptions.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedShipping === option.id
                            ? 'border-naaz-green bg-naaz-green/5'
                            : 'border-gray-200 hover:border-naaz-green/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            value={option.id}
                            checked={selectedShipping === option.id}
                            onChange={(e) => setSelectedShipping(e.target.value)}
                            className="text-naaz-green focus:ring-naaz-green"
                          />
                          <div>
                            <div className="font-medium text-naaz-green">
                              {option.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {option.description}
                            </div>
                            <div className="text-xs text-gray-500">
                              {option.time}
                            </div>
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-naaz-gold">
                          {option.price === 0 ? 'FREE' : `₹${option.price}`}
                        </div>
                      </label>
                    ))}
                  </div>
                </motion.div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <CartSummary
                    subtotal={subtotal}
                    shipping={shipping}
                    total={total}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <CartEmpty />
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

export default Cart;
