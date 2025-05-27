
import React from 'react';

interface EmptyCartMessageProps {
  onBrowseBooks: () => void;
}

const EmptyCartMessage: React.FC<EmptyCartMessageProps> = ({ onBrowseBooks }) => {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-playfair font-bold text-naaz-green mb-4">
        Your cart is empty
      </h1>
      <p className="text-gray-600 mb-8">
        Add some books to your cart before checkout.
      </p>
      <button
        onClick={onBrowseBooks}
        className="bg-naaz-green text-white px-6 py-3 rounded-lg hover:bg-naaz-green/90 transition-colors"
      >
        Browse Books
      </button>
    </div>
  );
};

export default EmptyCartMessage;
