
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const CartEmpty = () => {
  return (
    <div className="text-center py-16">
      <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
      <h2 className="text-2xl font-playfair font-semibold text-naaz-green mb-4">
        Your cart is empty
      </h2>
      <p className="text-gray-600 mb-8">
        Looks like you haven't added any items to your cart yet.
      </p>
      <Link 
        to="/products"
        className="inline-block bg-naaz-green text-white px-8 py-3 rounded-lg hover:bg-naaz-green/90 transition-colors"
      >
        Start Shopping
      </Link>
    </div>
  );
};

export default CartEmpty;
