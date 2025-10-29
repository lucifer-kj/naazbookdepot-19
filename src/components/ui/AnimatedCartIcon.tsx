
import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartContext } from '@/lib/context/CartContext';

const AnimatedCartIcon: React.FC = () => {
  const { cart } = useCartContext();
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevCount, setPrevCount] = useState(cart.totalItems);

  useEffect(() => {
    if (cart.totalItems !== prevCount && cart.totalItems > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      setPrevCount(cart.totalItems);
      return () => clearTimeout(timer);
    }
    setPrevCount(cart.totalItems);
  }, [cart.animationTrigger, cart.totalItems, prevCount]);

  return (
    <div className="relative">
      <ShoppingCart 
        className={`text-naaz-green hover:text-naaz-gold transition-colors ${
          isAnimating ? 'animate-bounce' : ''
        }`} 
        size={24} 
      />
      {cart.totalItems > 0 && (
        <span 
          className={`absolute -top-2 -right-2 bg-naaz-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium transition-all duration-300 ${
            isAnimating ? 'animate-pulse scale-110' : 'scale-100'
          }`}
        >
          {cart.totalItems > 99 ? '99+' : cart.totalItems}
        </span>
      )}
    </div>
  );
};

export default AnimatedCartIcon;
