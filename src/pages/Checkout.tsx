
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Checkout = () => {
  const [step, setStep] = useState(1);

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

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-playfair font-semibold text-naaz-green mb-6">Shipping Information</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-gray-700 mb-2">First Name</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-gray-700 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="address" className="block text-gray-700 mb-2">Address</label>
                <input 
                  type="text" 
                  id="address" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                />
              </div>
              
              <div>
                <label htmlFor="apartment" className="block text-gray-700 mb-2">Apartment, suite, etc. (optional)</label>
                <input 
                  type="text" 
                  id="apartment" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="city" className="block text-gray-700 mb-2">City</label>
                  <input 
                    type="text" 
                    id="city" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-gray-700 mb-2">State</label>
                  <input 
                    type="text" 
                    id="state" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                  />
                </div>
                <div>
                  <label htmlFor="zip" className="block text-gray-700 mb-2">PIN Code</label>
                  <input 
                    type="text" 
                    id="zip" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-gray-700 mb-2">Phone</label>
                <input 
                  type="tel" 
                  id="phone" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                />
              </div>
              
              <div className="flex items-center">
                <input type="checkbox" id="saveAddress" className="h-4 w-4 text-naaz-gold focus:ring-naaz-green" />
                <label htmlFor="saveAddress" className="ml-2 block text-sm text-gray-700">
                  Save this address for future orders
                </label>
              </div>
              
              <div className="pt-6 flex justify-between">
                <Link to="/cart" className="text-naaz-green hover:text-naaz-gold transition-colors">
                  Return to cart
                </Link>
                <button 
                  type="button" 
                  onClick={() => setStep(2)} 
                  className="gold-button flex items-center"
                >
                  Continue to Payment
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </form>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-playfair font-semibold text-naaz-green mb-6">Payment Method</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <div className="mb-6 border-b border-gray-200 pb-4">
                  <div className="flex items-center">
                    <input type="radio" id="card" name="payment" className="h-4 w-4 text-naaz-gold focus:ring-naaz-green" defaultChecked />
                    <label htmlFor="card" className="ml-2 block text-gray-700">Credit/Debit Card</label>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cardNumber" className="block text-gray-700 mb-2">Card Number</label>
                    <input 
                      type="text" 
                      id="cardNumber" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="expDate" className="block text-gray-700 mb-2">Expiration Date</label>
                      <input 
                        type="text" 
                        id="expDate" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label htmlFor="cvv" className="block text-gray-700 mb-2">CVV</label>
                      <input 
                        type="text" 
                        id="cvv" 
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                        placeholder="123"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="nameOnCard" className="block text-gray-700 mb-2">Name on Card</label>
                    <input 
                      type="text" 
                      id="nameOnCard" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green"
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <input type="radio" id="cod" name="payment" className="h-4 w-4 text-naaz-gold focus:ring-naaz-green" />
                  <label htmlFor="cod" className="ml-2 block text-gray-700">Cash on Delivery</label>
                </div>
              </div>
              
              <div className="flex items-center">
                <input type="checkbox" id="saveCard" className="h-4 w-4 text-naaz-gold focus:ring-naaz-green" />
                <label htmlFor="saveCard" className="ml-2 block text-sm text-gray-700">
                  Save my payment information for future purchases
                </label>
              </div>
              
              <div className="pt-6 flex justify-between">
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="text-naaz-green hover:text-naaz-gold transition-colors"
                >
                  Return to shipping
                </button>
                <button 
                  type="button" 
                  onClick={() => setStep(3)} 
                  className="gold-button flex items-center"
                >
                  Review Order
                  <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-playfair font-semibold text-naaz-green mb-6">Review Order</h2>
            
            <div className="mb-8 space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-naaz-green mb-3">Shipping Address</h3>
                <p className="text-gray-600">Ahmed Khan</p>
                <p className="text-gray-600">123 Main Street, Apartment 4B</p>
                <p className="text-gray-600">Kolkata, West Bengal, 700001</p>
                <p className="text-gray-600">India</p>
                <p className="text-gray-600">+91 98765 43210</p>
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="text-naaz-gold hover:underline mt-2 text-sm"
                >
                  Edit
                </button>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-naaz-green mb-3">Payment Method</h3>
                <p className="text-gray-600">Credit Card ending in 3456</p>
                <button 
                  type="button" 
                  onClick={() => setStep(2)} 
                  className="text-naaz-gold hover:underline mt-2 text-sm"
                >
                  Edit
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-medium text-naaz-green mb-4">Order Summary</h3>
            <div className="border-t border-gray-200 pt-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex py-4 border-b border-gray-200">
                  <div className="w-16 h-16 bg-naaz-cream flex-shrink-0 rounded overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="ml-4 flex-grow">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium text-naaz-green">{item.name}</h4>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-naaz-green">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">₹{shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-gray-200 mt-4">
                <span className="text-lg font-medium text-naaz-green">Total</span>
                <span className="text-lg font-bold text-naaz-green">₹{total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="pt-6 flex justify-between">
              <button 
                type="button" 
                onClick={() => setStep(2)} 
                className="text-naaz-green hover:text-naaz-gold transition-colors"
              >
                Return to payment
              </button>
              <button 
                type="button" 
                className="gold-button"
              >
                Place Order
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-playfair font-bold text-naaz-green">Checkout</h1>
          </div>
          
          {/* Checkout Progress */}
          <div className="mb-10">
            <div className="flex items-center">
              <div className={`flex-1 ${step >= 1 ? 'text-naaz-green' : 'text-gray-400'}`}>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 1 ? 'bg-naaz-green text-white' : 
                    step > 1 ? 'bg-naaz-gold text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    1
                  </div>
                  <span className="ml-2 font-medium">Shipping</span>
                </div>
              </div>
              
              <div className={`w-full max-w-[100px] h-1 ${step > 1 ? 'bg-naaz-gold' : 'bg-gray-200'}`}></div>
              
              <div className={`flex-1 ${step >= 2 ? 'text-naaz-green' : 'text-gray-400'}`}>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 2 ? 'bg-naaz-green text-white' : 
                    step > 2 ? 'bg-naaz-gold text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    2
                  </div>
                  <span className="ml-2 font-medium">Payment</span>
                </div>
              </div>
              
              <div className={`w-full max-w-[100px] h-1 ${step > 2 ? 'bg-naaz-gold' : 'bg-gray-200'}`}></div>
              
              <div className={`flex-1 ${step >= 3 ? 'text-naaz-green' : 'text-gray-400'}`}>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === 3 ? 'bg-naaz-green text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    3
                  </div>
                  <span className="ml-2 font-medium">Review</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Checkout Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                {renderStep()}
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                <h2 className="text-xl font-playfair font-semibold text-naaz-green mb-6 pb-4 border-b border-gray-200">
                  Order Summary
                </h2>
                
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center">
                      <div className="w-12 h-12 bg-naaz-cream rounded overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="ml-4 flex-grow">
                        <p className="text-sm font-medium text-naaz-green">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-naaz-green">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">₹{shipping.toFixed(2)}</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200 flex justify-between">
                    <span className="text-gray-800 font-semibold">Total</span>
                    <span className="font-bold text-naaz-green">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
