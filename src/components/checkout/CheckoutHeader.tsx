
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface CheckoutHeaderProps {
  onBackToCart: () => void;
}

const CheckoutHeader: React.FC<CheckoutHeaderProps> = ({ onBackToCart }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <button
        onClick={onBackToCart}
        className="flex items-center text-naaz-green hover:text-naaz-gold transition-colors mb-4"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Cart
      </button>
      <h1 className="text-3xl font-playfair font-bold text-naaz-green mb-2">
        Checkout
      </h1>
      <p className="text-gray-600">
        Bismillah - Complete your order with Allah's blessing
      </p>
    </motion.div>
  );
};

export default CheckoutHeader;
