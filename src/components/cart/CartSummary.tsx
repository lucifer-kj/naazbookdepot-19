
import React from 'react';
import { Link } from 'react-router-dom';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
}

const CartSummary: React.FC<CartSummaryProps> = ({ subtotal, shipping, total }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-fit">
      <h2 className="text-xl font-playfair font-semibold text-naaz-green mb-6">
        Order Summary
      </h2>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>₹{shipping.toFixed(2)}</span>
        </div>
        <div className="border-t pt-3">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-naaz-gold">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <Link 
        to="/checkout"
        className="block w-full bg-naaz-green text-white text-center py-3 rounded-lg hover:bg-naaz-green/90 transition-colors"
      >
        Proceed to Checkout
      </Link>
      
      <div className="mt-4 p-3 bg-naaz-gold/10 rounded-lg">
        <p className="text-xs text-naaz-green text-center">
          "And Allah is the best of providers" - Secure checkout with Islamic blessings
        </p>
      </div>
    </div>
  );
};

export default CartSummary;
