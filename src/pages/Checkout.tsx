import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Truck, Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import { UnifiedPayment } from '@/components/payment/UnifiedPayment';
import { supabase } from '@/integrations/supabase/client';
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
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [orderCreated, setOrderCreated] = useState(false);

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

  const handleContinueToPayment = () => {
    if (!validateForm()) return;
    setCurrentStep('payment');
  };

  const handlePaymentSuccess = async (transactionId: string, paymentMethod: string) => {
    setLoading(true);
    
    try {
      const orderData = {
        user_id: user?.id || null,
        total_amount: finalTotal,
        status: 'pending',
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'cod' ? 'pending' : 'completed',
        transaction_id: transactionId,
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
          import('../lib/utils/consoleMigration').then(({ handleDatabaseError }) => {
            handleDatabaseError(stockError, 'update_stock');
          });
        }
      }

      clearCart();
      setOrderCreated(true);
      setCurrentStep('confirmation');
      
      toast.success('Order placed successfully!');
      
      // Redirect to order confirmation after a short delay
      setTimeout(() => {
        navigate('/order-confirmation', { 
          state: { 
            orderId: order.id,
            orderData: order,
            transactionId,
            paymentMethod
          } 
        });
      }, 2000);
    } catch (error) {
      import('../lib/utils/consoleMigration').then(({ handleApiError }) => {
        handleApiError(error, 'place_order');
      });
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentFailure = (error: string) => {
    toast.error(`Payment failed: ${error}`);
    setCurrentStep('payment');
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
            onClick={() => {
              if (currentStep === 'payment') {
                setCurrentStep('shipping');
              } else {
                navigate('/cart');
              }
            }}
            className="flex items-center text-naaz-green hover:text-green-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentStep === 'payment' ? 'Back to Shipping' : 'Back to Cart'}
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${currentStep === 'shipping' ? 'text-naaz-green' : currentStep === 'payment' || currentStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'shipping' ? 'bg-naaz-green text-white' : currentStep === 'payment' || currentStep === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Shipping</span>
            </div>
            <div className={`w-16 h-0.5 ${currentStep === 'payment' || currentStep === 'confirmation' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${currentStep === 'payment' ? 'text-naaz-green' : currentStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'payment' ? 'bg-naaz-green text-white' : currentStep === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
            <div className={`w-16 h-0.5 ${currentStep === 'confirmation' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${currentStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2 font-medium">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Step */}
            {currentStep === 'shipping' && (
              <>
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

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Special Instructions (Optional)</h2>
                  <Textarea
                    placeholder="unknown special delivery instructions..."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleContinueToPayment}
                  className="w-full bg-naaz-green hover:bg-green-600"
                >
                  Continue to Payment
                </Button>
              </>
            )}

            {/* Payment Step */}
            {currentStep === 'payment' && (
              <UnifiedPayment
                orderId={`ORDER_${Date.now()}`}
                amount={finalTotal}
                currency="INR"
                customerInfo={{
                  firstName: shippingAddress.fullName.split(' ')[0] || '',
                  lastName: shippingAddress.fullName.split(' ').slice(1).join(' ') || '',
                  email: shippingAddress.email,
                  phone: shippingAddress.phone,
                  country: shippingAddress.country
                }}
                shippingAddress={{
                  addressLine1: shippingAddress.address,
                  city: shippingAddress.city,
                  state: shippingAddress.state,
                  postalCode: shippingAddress.pincode,
                  countryCode: shippingAddress.country === 'India' ? 'IN' : 'US'
                }}
                productInfo={`Order from Naaz Books - ${cart.length} items`}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
              />
            )}

            {/* Confirmation Step */}
            {currentStep === 'confirmation' && (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-600 mb-2">Order Placed Successfully!</h2>
                <p className="text-gray-600 mb-4">
                  Thank you for your order. You will receive a confirmation email shortly.
                </p>
                {loading && (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>Processing your order...</span>
                  </div>
                )}
              </div>
            )}
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
              
              {currentStep === 'shipping' && (
                <Button
                  onClick={handleContinueToPayment}
                  className="w-full mt-6 bg-naaz-green hover:bg-green-600"
                >
                  Continue to Payment
                </Button>
              )}
              
              {currentStep === 'payment' && (
                <div className="mt-6 text-center text-sm text-gray-600">
                  Complete payment to place your order
                </div>
              )}
              
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
