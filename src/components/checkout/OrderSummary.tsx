
import React, { useState, useEffect } from 'react';
import { Tag, Gift } from 'lucide-react';
import { Cart } from '@/lib/context/CartContext';

interface OrderSummaryProps {
  cart: Cart;
  shippingCost?: number; // Optional prop for dynamic shipping cost
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cart, shippingCost = 100 }) => {
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [currentShippingCost, setCurrentShippingCost] = useState(shippingCost);

  useEffect(() => {
    // Update shipping cost if cart is empty or prop changes
    setCurrentShippingCost(cart.items.length > 0 ? shippingCost : 0);
  }, [cart.items.length, shippingCost]);

  const tax = Math.round(cart.subtotal * 0.02); // 2% tax
  const total = cart.subtotal + currentShippingCost + tax - appliedDiscount;

  const applyDiscount = () => {
    if (discountCode === 'FIRST10') {
      setAppliedDiscount(Math.round(cart.subtotal * 0.1));
    } else if (discountCode === 'ISLAMIC20') {
      setAppliedDiscount(Math.round(cart.subtotal * 0.2));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 h-fit">
      <h2 className="text-xl font-playfair font-semibold text-naaz-green mb-6">
        Order Summary
      </h2>
      
      <div className="space-y-4 mb-6">
        {cart.items.map((item) => (
          <div key={`${item.productId}-${item.variationId}`} className="flex gap-3">
            <img 
              src={item.image} 
              alt={item.name}
              className="w-16 h-16 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-medium text-naaz-green text-sm">{item.name}</h3>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-600 text-sm">Qty: {item.quantity}</span>
                <span className="font-semibold text-naaz-gold">₹{item.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t pt-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Tag size={16} className="text-naaz-green" />
          <span className="text-sm font-medium text-naaz-green">Discount Code</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder="Enter code"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green"
          />
          <button
            onClick={applyDiscount}
            className="px-4 py-2 text-sm bg-naaz-green text-white rounded-lg hover:bg-naaz-green/90 transition-colors"
          >
            Apply
          </button>
        </div>
        {appliedDiscount > 0 && (
          <div className="mt-2 text-sm text-green-600">
            Discount applied: -₹{appliedDiscount}
          </div>
        )}
      </div>
      
      <div className="space-y-3 border-t pt-4">
        <div className="flex justify-between">
          <span>Subtotal ({cart.totalItems} items)</span>
          <span>₹{cart.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>₹{currentShippingCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        {appliedDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-₹{appliedDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t pt-3">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-naaz-gold">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-6 p-3 bg-naaz-gold/10 rounded-lg">
        <div className="flex items-center text-naaz-green mb-1">
          <Gift size={16} className="mr-2" />
          <span className="text-sm font-medium">Islamic Blessing</span>
        </div>
        <p className="text-xs text-gray-600">
          "And Allah is the best of providers" - May your purchase bring you knowledge and blessings
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
