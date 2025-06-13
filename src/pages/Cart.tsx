
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartContext } from '@/lib/context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartEmpty from '@/components/cart/CartEmpty';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import PromoCodeInput from '@/components/cart/PromoCodeInput';

const Cart = () => {
  const { cart, updateQuantity, removeItem, clearCart } = useCartContext();
  const [appliedPromo, setAppliedPromo] = useState<string>('');
  const [promoDiscount, setPromoDiscount] = useState<number>(0);

  // Calculate cart totals
  const subtotal = cart.subtotal;
  const shipping = cart.items.length > 0 ? 100 : 0;
  const total = subtotal + shipping - promoDiscount;

  const handleApplyPromo = async (code: string) => {
    if (!code) {
      setAppliedPromo('');
      setPromoDiscount(0);
      return;
    }

    // Mock promo code logic - in real app, this would be an API call
    const validPromoCodes: Record<string, number> = {
      'SAVE10': subtotal * 0.1,
      'FIRSTORDER': 100,
      'STUDENT20': subtotal * 0.2,
    };

    if (validPromoCodes[code.toUpperCase()]) {
      setAppliedPromo(code.toUpperCase());
      setPromoDiscount(validPromoCodes[code.toUpperCase()]);
    } else {
      // In real app, show error toast
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 px-4">
        <div className="container mx-auto">
          <motion.h1 
            className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Your Shopping Cart
          </motion.h1>
          
          {cart.items.length > 0 ? (
            <motion.div 
              className="grid lg:grid-cols-3 gap-10"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-playfair font-semibold text-naaz-green">
                        Cart Items ({cart.totalItems})
                      </h2>
                      <motion.button 
                        className="text-naaz-burgundy hover:text-naaz-burgundy/80 flex items-center font-medium"
                        onClick={clearCart}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={cart.items.length === 0}
                      >
                        <Trash2 size={16} className="mr-1" />
                        Clear Cart
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {cart.items.map((item) => (
                      <CartItem
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
