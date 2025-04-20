
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
}

const CartSummary = ({ subtotal, shipping, total }: CartSummaryProps) => {
  return (
    <motion.div className="lg:col-span-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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
  );
};

export default CartSummary;
