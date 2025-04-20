
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const CartEmpty = () => {
  return (
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
  );
};

export default CartEmpty;
