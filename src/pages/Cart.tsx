
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

const Cart = () => {
  // Mock cart items
  const cartItems = [
    {
      id: 1,
      name: 'The Noble Quran',
      category: 'Books',
      price: 1200,
      quantity: 1,
      image: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png',
    },
    {
      id: 2,
      name: 'Amber Oud Attar',
      category: 'Perfumes',
      price: 850,
      quantity: 2,
      image: '/lovable-uploads/35ff87ed-b986-45b1-9c00-555f9d78c627.png',
    },
    {
      id: 3,
      name: 'Premium Prayer Mat',
      category: 'Essentials',
      price: 950,
      quantity: 1,
      image: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png',
    },
  ];

  // Calculate cart totals
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 100;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green mb-10">Your Shopping Cart</h1>
          
          {cartItems.length > 0 ? (
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-playfair font-semibold text-naaz-green">
                        Cart Items ({cartItems.length})
                      </h2>
                      <button className="text-naaz-burgundy hover:text-naaz-burgundy/80 flex items-center font-medium">
                        <Trash2 size={16} className="mr-1" />
                        Clear Cart
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row gap-4 pb-6 border-b border-gray-200">
                        <div className="sm:w-24 h-24 bg-naaz-cream flex-shrink-0 rounded-md overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <div>
                              <p className="text-sm text-gray-500">{item.category}</p>
                              <h3 className="text-lg font-playfair font-semibold text-naaz-green mb-1">{item.name}</h3>
                            </div>
                            <div className="text-right sm:ml-4">
                              <p className="font-medium text-naaz-green">₹{item.price.toFixed(2)}</p>
                              <p className="text-sm text-gray-500">₹{item.price.toFixed(2)} each</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <button className="px-3 py-1 hover:bg-gray-100 transition-colors">
                                <Minus size={16} />
                              </button>
                              <span className="px-3 py-1 border-l border-r border-gray-300">
                                {item.quantity}
                              </span>
                              <button className="px-3 py-1 hover:bg-gray-100 transition-colors">
                                <Plus size={16} />
                              </button>
                            </div>
                            <button className="text-naaz-burgundy hover:text-naaz-burgundy/80 flex items-center">
                              <Trash2 size={16} className="mr-1" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                  <h2 className="text-xl font-playfair font-semibold text-naaz-green mb-6 pb-4 border-b border-gray-200">
                    Order Summary
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">₹{shipping.toFixed(2)}</span>
                    </div>
                    <div className="pt-4 mt-4 border-t border-gray-200 flex justify-between">
                      <span className="text-gray-800 font-semibold">Total</span>
                      <span className="font-bold text-naaz-green">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Link 
                    to="/checkout" 
                    className="gold-button w-full text-center mt-8 flex items-center justify-center"
                  >
                    <ShoppingBag size={18} className="mr-2" />
                    Proceed to Checkout
                  </Link>
                  
                  <div className="mt-6">
                    <h3 className="font-medium text-naaz-green mb-3">Accepted Payment Methods</h3>
                    <div className="flex space-x-3">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/1200px-Visa_Inc._logo.svg.png" alt="Visa" className="h-8 w-auto" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1200px-Mastercard-logo.svg.png" alt="Mastercard" className="h-8 w-auto" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" alt="PayPal" className="h-8 w-auto" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-10 text-center">
              <div className="flex justify-center mb-6">
                <ShoppingBag size={64} className="text-naaz-green opacity-50" />
              </div>
              <h2 className="text-2xl font-playfair font-semibold text-naaz-green mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
              <Link to="/" className="gold-button inline-block">
                Continue Shopping
              </Link>
            </div>
          )}
          
          {/* Continue Shopping */}
          <div className="mt-10">
            <Link to="/" className="flex items-center text-naaz-green hover:text-naaz-gold transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
