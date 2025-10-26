import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../lib/hooks/useCart';
import { useAuth } from '../lib/hooks/useAuth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Loader2, CreditCard, Truck, Shield, ArrowLeft } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart, getTotalPrice } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    for (const field of required) {
      if (!shippingAddress[field as keyof ShippingAddress]) {
        toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingAddress.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    
    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(shippingAddress.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    
    // Pincode validation
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(shippingAddress.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const orderData = {
        user_id: user?.id || null,
        total_amount: getTotalPrice(),
        status: 'pending',
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
        shipping_address: shippingAddress,
        special_instructions: specialInstructions || null,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          title: item.title
        }))
      };

      const { data: order, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      // Insert order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update product stock
      for (const item of cart) {
        const { error: stockError } = await supabase.rpc('update_product_stock', {
          product_id: item.id,
          quantity_sold: item.quantity
        });
        
        if (stockError) {
          console.error('Stock update error:', stockError);
        }
      }

      clearCart();
      
      if (paymentMethod === 'upi') {
        navigate('/upi-payment', { 
          state: { 
            orderId: order.id, 
            amount: getTotalPrice(),
            orderData: order
          } 
        });
      } else {
        navigate('/order-confirmation', { 
          state: { 
            orderId: order.id,
            orderData: order
          } 
        });
      }
      
      toast.success('Order placed successfully!');
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const shippingCost = getTotalPrice() >= 500 ? 0 : 50;
  const finalTotal = getTotalPrice() + shippingCost;

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center text-naaz-green hover:text-green-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Truck className="w-5 h-5 text-naaz-green mr-2" />
                <h2 className="text-xl font-semibold">Shipping Address</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  placeholder="Full Name *"
                  value={shippingAddress.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
                <Input
                  type="email"
                  placeholder="Email Address *"
                  value={shippingAddress.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                <Input
                  type="tel"
                  placeholder="Phone Number *"
                  value={shippingAddress.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
                <Input
                  placeholder="Pincode *"
                  value={shippingAddress.pincode}
                  onChange={(e) => handleInputChange('pincode', e.target.value)}
                />
              </div>
              
              <div className="mt-4">
                <Textarea
                  placeholder="Complete Address *"
                  value={shippingAddress.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="mb-4"
                />
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <Input
                  placeholder="City *"
                  value={shippingAddress.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
                <Input
                  placeholder="State *"
                  value={shippingAddress.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                />
                <Input
                  placeholder="Country"
                  value={shippingAddress.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="w-5 h-5 text-naaz-green mr-2" />
                <h2 className="text-xl font-semibold">Payment Method</h2>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-sm text-gray-600">Pay when you receive your order</div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'upi')}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">UPI Payment</div>
                    <div className="text-sm text-gray-600">Pay instantly using UPI</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Special Instructions (Optional)</h2>
              <Textarea
                placeholder="Any special delivery instructions..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center mb-4">
                <Shield className="w-5 h-5 text-naaz-green mr-2" />
                <h2 className="text-xl font-semibold">Order Summary</h2>
              </div>
              
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="flex-1 truncate">{item.title} × {item.quantity}</span>
                    <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
              
              {shippingCost === 0 && (
                <div className="mt-3 text-sm text-green-600 bg-green-50 p-2 rounded">
                  🎉 You've qualified for free shipping!
                </div>
              )}
              
              <Button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full mt-6 bg-naaz-green hover:bg-green-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  `Place Order - ₹${finalTotal.toFixed(2)}`
                )}
              </Button>
              
              <div className="mt-4 text-xs text-gray-500 text-center">
                By placing your order, you agree to our Terms of Service and Privacy Policy.
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;