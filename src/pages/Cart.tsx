
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartContext } from '@/lib/context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartEmpty from '@/components/cart/CartEmpty';
import OptimizedCartItem from '@/components/cart/OptimizedCartItem';
import CartSummary from '@/components/cart/CartSummary';
import PromoCodeInput from '@/components/cart/PromoCodeInput';

const Cart = () => {
  const { cart, updateQuantity, removeItem, clearCart, isLoading } = useCartContext();
  const [appliedPromo, setAppliedPromo] = useState<string>('');
  const [promoDiscount, setPromoDiscount] = useState<number>(0);

  // GST/Tax logic for Indian eCommerce standards
  const subtotal = cart.subtotal;
  const gstRate = 0.12;
  const gstAmount = +(subtotal * gstRate).toFixed(2);
  const baseSubtotal = +(subtotal / (1 + gstRate)).toFixed(2);
  const shipping = cart.items.length > 0 ? 100 : 0;
  const total = subtotal + shipping - promoDiscount;

  const handleApplyPromo = async (code: string) => {
    if (!code) {
      setAppliedPromo('');
      setPromoDiscount(0);
      return;
    }

    const validPromoCodes: Record<string, number> = {
      'SAVE10': subtotal * 0.1,
      'FIRSTORDER': 100,
      'STUDENT20': subtotal * 0.2,
    };

    if (validPromoCodes[code.toUpperCase()]) {
      setAppliedPromo(code.toUpperCase());
      setPromoDiscount(validPromoCodes[code.toUpperCase()]);
    } else {
      alert('Invalid promo code');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-16 px-4">
          <div className="flex items-center space-x-2 text-naaz-green">
            <Loader2 className="animate-spin" size={24} />
            <span>Loading your cart...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 md:py-16 px-4">
        <div className="container mx-auto">
          <motion.h1 
            className="text-2xl md:text-4xl font-playfair font-bold text-naaz-green mb-6 md:mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Your Shopping Cart
          </motion.h1>
          
          {cart.items.length > 0 ? (
            <motion.div 
              className="grid lg:grid-cols-3 gap-6 lg:gap-10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                      <h2 className="text-lg md:text-xl font-playfair font-semibold text-naaz-green">
                        Cart Items ({cart.totalItems})
                      </h2>
                      <motion.button 
                        className="text-naaz-burgundy hover:text-naaz-burgundy/80 flex items-center font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        onClick={clearCart}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={cart.items.length === 0 || isLoading}
                      >
                        <Trash2 size={16} className="mr-1" />
                        Clear Cart
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="space-y-4 md:space-y-6">
                    {cart.items.map((item) => (
                      <OptimizedCartItem
                        key={`${item.productId}-${item.variationId || ''}`}
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeItem}
                      />
                    ))}
                  </div>
                </div>

                {/* Promo Code Section */}
                <div className="mt-6">
                  <PromoCodeInput
                    onApplyPromo={handleApplyPromo}
                    appliedPromo={appliedPromo}
                    discount={promoDiscount}
                  />
                </div>

                {/* GST Breakdown for Indian eCommerce */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Item value (excl. GST):</span>
                    <span>₹{baseSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST @12% included:</span>
                    <span>₹{gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>₹{shipping.toFixed(2)}</span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedPromo})</span>
                      <span>-₹{promoDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-naaz-gold">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <CartSummary
                subtotal={subtotal}
                shipping={shipping}
                total={total}
                discount={promoDiscount}
                promoCode={appliedPromo}
              />
            </motion.div>
          ) : (
            <CartEmpty />
          )}
          
          <motion.div 
            className="mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link to="/" className="flex items-center text-naaz-green hover:text-naaz-gold transition-colors">
              <ArrowLeft size={18} className="mr-2" />
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
