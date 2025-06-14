
import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { CartItem as CartItemType } from '@/lib/context/CartContext';

interface OptimizedCartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: number, variationId: string | undefined, quantity: number) => void;
  onRemove: (productId: number, variationId?: string) => void;
}

const OptimizedCartItem = React.memo<OptimizedCartItemProps>(({ item, onUpdateQuantity, onRemove }) => {
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0) {
      onUpdateQuantity(item.productId, item.variationId, newQuantity);
    }
  };

  return (
    <div className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
      <img 
        src={item.image} 
        alt={item.name}
        className="w-16 h-16 object-cover rounded-lg"
        loading="lazy"
      />
      <div className="flex-1">
        <h3 className="font-medium text-naaz-green">{item.name}</h3>
        <p className="text-naaz-gold font-semibold">₹{item.price}</p>
      </div>
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => handleQuantityChange(item.quantity - 1)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          disabled={item.quantity <= 1}
          aria-label="Decrease quantity"
        >
          <Minus size={16} />
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button 
          onClick={() => handleQuantityChange(item.quantity + 1)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          aria-label="Increase quantity"
        >
          <Plus size={16} />
        </button>
      </div>
      <button 
        onClick={() => onRemove(item.productId, item.variationId)}
        className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
        aria-label="Remove item"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
});

OptimizedCartItem.displayName = 'OptimizedCartItem';

export default OptimizedCartItem;
