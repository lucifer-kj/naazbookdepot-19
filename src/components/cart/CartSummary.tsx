import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Gift } from 'lucide-react';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
}

const CartSummary: React.FC<CartSummaryProps> = ({ subtotal, shipping, total }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <h2 className="text-xl font-playfair font-semibold text-naaz-green mb-6">
        Order Summary
      </h2>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between font-semibold text-lg">
            <span className="text-gray-800">Total</span>
            <span className="text-naaz-gold">₹{total.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Including GST and shipping charges
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate('/checkout')}
        className="w-full bg-naaz-green text-white py-3 px-6 rounded-lg hover:bg-naaz-green/90 transition-colors flex items-center justify-center font-medium"
      >
        Proceed to Checkout
        <ArrowRight size={18} className="ml-2" />
      </button>

      <div className="mt-6">
        <div className="flex items-center gap-2 text-naaz-green mb-2">
          <Gift size={16} />
          <span className="text-sm font-medium">Gift Message</span>
        </div>
        <textarea
          placeholder="Add a gift message or special instructions..."
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green/20 focus:border-naaz-green/40"
          rows={2}
        />
      </div>
      
      <div className="mt-6 p-4 bg-naaz-gold/10 rounded-lg">
        <p className="text-sm text-naaz-green text-center">
          "And Allah is the best of providers" - Secure checkout with Islamic blessings
        </p>
      </div>
    </motion.div>
  );
};

export default CartSummary;
