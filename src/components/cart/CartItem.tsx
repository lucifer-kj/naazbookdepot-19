
import React, { useState } from 'react';
import { Trash2, Plus, Minus, Loader2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/lib/hooks/useCart';
import { HoverAnimation } from '@/components/ui/transitions';
import { useUserFeedback } from '@/lib/hooks/useUserFeedback';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (cartItemId: string, quantity: number) => void;
  onRemove: (cartItemId: string) => void;
  isLoading?: boolean;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove, isLoading = false }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { showOperationFeedback } = useUserFeedback();

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity > 0 && !isUpdating) {
      setIsUpdating(true);
      try {
        await onUpdateQuantity(item.id, newQuantity);
        showOperationFeedback('Cart update', true);
      } catch (error) {
        showOperationFeedback('Cart update', false);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleRemove = async () => {
    if (!isUpdating) {
      setIsUpdating(true);
      try {
        await onRemove(item.id);
        showOperationFeedback('Item removal', true, 'Item removed from cart');
      } catch (error) {
        showOperationFeedback('Item removal', false);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <HoverAnimation className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
      <div className={`relative ${isLoading || isUpdating ? 'opacity-50' : ''}`}>
        <img 
          src={item.products.image_url || '/placeholder.svg'} 
          alt={item.products.title}
          className="w-16 h-16 object-cover rounded-lg"
        />
        {(isLoading || isUpdating) && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
            <Loader2 className="h-4 w-4 animate-spin text-naaz-green" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-naaz-green">{item.products.title}</h3>
        <p className="text-naaz-gold font-semibold">₹{item.products.price}</p>
      </div>
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => handleQuantityChange(item.quantity - 1)}
          className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={item.quantity <= 1 || isUpdating || isLoading}
        >
          <Minus size={16} />
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button 
          onClick={() => handleQuantityChange(item.quantity + 1)}
          className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isUpdating || isLoading}
        >
          <Plus size={16} />
        </button>
      </div>
      <button 
        onClick={handleRemove}
        className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isUpdating || isLoading}
      >
        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={16} />}
      </button>
    </HoverAnimation>
  );
};

export default CartItem;
