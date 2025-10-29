import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useUpdateCartItem, useRemoveFromCart } from '@/lib/hooks/useCart';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartItem from '@/components/cart/CartItem';
import PromoCodeInput from '@/components/cart/PromoCodeInput';
import CartEmpty from '@/components/cart/CartEmpty';
import { ShoppingBag, Truck, Shield, ArrowRight, Gift } from 'lucide-react';
import { toast } from 'sonner';

const Cart = () => {
  const navigate = useNavigate();
  const { data: cart = [], isLoading } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const { user } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Helper functions
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.products.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleUpdateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      await updateCartItem.mutateAsync({ cartItemId, quantity });
    } catch (error) {
      import('../lib/utils/consoleMigration').then(({ handleApiError }) => {
        handleApiError(error, 'update_cart_item');
      });
    }
  };

  const handleRemoveFromCart = async (cartItemId: string) => {
    try {
      await removeFromCart.mutateAsync(cartItemId);
    } catch (error) {
      import('../lib/utils/consoleMigration').then(({ handleApiError }) => {
        handleApiError(error, 'remove_cart_item');
      });
    }
  };

  const subtotal = getTotalPrice();
  const shippingCost = subtotal >= 500 ? 0 : 50;
  const discountAmount = (subtotal * discount) / 100;
  const finalTotal = subtotal + shippingCost - discountAmount;

  // Mock promo codes for demonstration
  const promoCodes = {
    'WELCOME10': 10,
    'SAVE20': 20,
    'NEWUSER': 15,
    'BOOKS25': 25
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      const upperPromoCode = promoCode.toUpperCase();
      if (promoCodes[upperPromoCode as keyof typeof promoCodes]) {
        const discountPercent = promoCodes[upperPromoCode as keyof typeof promoCodes];
        setDiscount(discountPercent);
        toast.success(`Promo code applied! ${discountPercent}% discount`);
      } else {
        toast.error('Invalid promo code');
      }
    }, 1000);
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      toast.error('Please login to proceed to checkout');
      // You could redirect to login modal here
      return;
    }
    
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading cart...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <CartEmpty />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveFromCart}
              />
            ))}
            
            {/* Continue Shopping */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <button
                onClick={() => navigate('/products')}
                className="flex items-center text-naaz-green hover:text-green-600 transition-colors"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Continue Shopping
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center mb-6">
                <ShoppingBag className="w-5 h-5 text-naaz-green mr-2" />
                <h2 className="text-xl font-semibold">Order Summary</h2>
              </div>

              {/* Promo Code Section */}
              <div className="mb-6">
                <PromoCodeInput
                  onApplyPromo={(code) => {
                    setPromoCode(code);
                    handleApplyPromo();
                  }}
                  appliedPromo={discount > 0 ? promoCode : undefined}
                  discount={discount}
                />
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discount}%)</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `₹${shippingCost}`
                    )}
                  </span>
                </div>
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Free Shipping Banner */}
              {subtotal < 500 && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center text-blue-700">
                    <Truck className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      Add ₹{(500 - subtotal).toFixed(2)} more for free shipping!
                    </span>
                  </div>
                </div>
              )}

              {subtotal >= 500 && (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-700">
                    <Gift className="w-4 h-4 mr-2" />
                    <span className="text-sm">🎉 You've qualified for free shipping!</span>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <Button
                onClick={handleProceedToCheckout}
                className="w-full bg-naaz-green hover:bg-green-600 mb-4"
                size="lg"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              {/* Security Badge */}
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Shield className="w-4 h-4 mr-1" />
                <span>Secure checkout guaranteed</span>
              </div>

              {/* Available Promo Codes */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-medium text-gray-900 mb-3">Available Offers</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline" className="text-xs">WELCOME10</Badge>
                    <span className="text-gray-600">10% off</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline" className="text-xs">SAVE20</Badge>
                    <span className="text-gray-600">20% off</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline" className="text-xs">BOOKS25</Badge>
                    <span className="text-gray-600">25% off</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recently Viewed or Recommended Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-center space-x-4">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
              <div className="text-center">
                <p className="text-gray-600 mb-2">Discover more Islamic books</p>
                <button
                  onClick={() => navigate('/products')}
                  className="text-naaz-green hover:text-green-600 font-medium"
                >
                  Browse our collection →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Cart;
