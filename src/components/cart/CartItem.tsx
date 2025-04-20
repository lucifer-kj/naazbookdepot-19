
import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Trash2 } from 'lucide-react';

interface CartItemProps {
  item: {
    productId: number;
    name: string;
    price: string;
    quantity: number;
    image?: string;
    variationId?: number;
    attributes?: {
      name: string;
      value: string;
    }[];
  };
  onUpdateQuantity: (productId: number, quantity: number, variationId?: number) => void;
  onRemove: (productId: number, variationId?: number) => void;
}

const CartItem = ({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  return (
    <motion.div 
      className="flex flex-col sm:flex-row gap-4 pb-6 border-b border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="sm:w-24 h-24 bg-naaz-cream flex-shrink-0 rounded-md overflow-hidden">
        <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-grow">
        <div className="flex flex-col sm:flex-row sm:justify-between">
          <div>
            <h3 className="text-lg font-playfair font-semibold text-naaz-green mb-1">{item.name}</h3>
            {item.attributes?.map((attr, index) => (
              <p key={index} className="text-sm text-gray-500">
                {attr.name}: {attr.value}
              </p>
            ))}
          </div>
          <div className="text-right sm:ml-4">
            <p className="font-medium text-naaz-green">₹{Number(item.price).toLocaleString('en-IN')}</p>
            <p className="text-sm text-gray-500">₹{Number(item.price).toLocaleString('en-IN')} each</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center border border-gray-300 rounded-md">
            <motion.button 
              className="px-3 py-1 hover:bg-gray-100 transition-colors"
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1, item.variationId)}
              whileTap={{ scale: 0.9 }}
              disabled={item.quantity <= 1}
            >
              <Minus size={16} />
            </motion.button>
            <span className="px-3 py-1 border-l border-r border-gray-300">
              {item.quantity}
            </span>
            <motion.button 
              className="px-3 py-1 hover:bg-gray-100 transition-colors"
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1, item.variationId)}
              whileTap={{ scale: 0.9 }}
            >
              <Plus size={16} />
            </motion.button>
          </div>
          <motion.button 
            className="text-naaz-burgundy hover:text-naaz-burgundy/80 flex items-center"
            onClick={() => onRemove(item.productId, item.variationId)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 size={16} className="mr-1" />
            Remove
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CartItem;
