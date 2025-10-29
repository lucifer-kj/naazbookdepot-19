import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, AlertCircle } from 'lucide-react';

interface OrderTrackingSearchProps {
  className?: string;
}

export const OrderTrackingSearch = ({ className = '' }: OrderTrackingSearchProps) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!orderNumber.trim()) {
      setError('Please enter an order number');
      return;
    }

    // Basic validation for order number format
    const cleanOrderNumber = orderNumber.trim().toUpperCase();
    if (cleanOrderNumber.length < 6) {
      setError('Order number must be at least 6 characters long');
      return;
    }

    // Navigate to tracking page
    navigate(`/track-order/${cleanOrderNumber}`);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <Package className="w-5 h-5 text-blue-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Track Your Order</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Order Number
          </label>
          <div className="relative">
            <input
              type="text"
              id="orderNumber"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Enter your order number (e.g., ORD123456)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
          {error && (
            <div className="flex items-center mt-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Track Order
        </button>
      </form>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>You can find your order number in your order confirmation email or receipt.</p>
      </div>
    </div>
  );
};

export default OrderTrackingSearch;