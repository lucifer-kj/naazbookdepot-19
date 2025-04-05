
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from './ProductDisplay';
import { useCartContext } from '@/lib/context/CartContext';
import { toast } from 'sonner';

interface RelatedProductsProps {
  products: Product[];
}

const RelatedProducts = ({ products }: RelatedProductsProps) => {
  const { addItem } = useCartContext();

  const handleQuickAdd = (product: Product, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0]?.src
    });
    
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-playfair font-bold text-naaz-green mb-6">Related Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <motion.div 
            key={product.id}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className="product-card group"
          >
            <Link to={`/product/${product.id}`}>
              <div className="relative overflow-hidden h-48 sm:h-64">
                <img 
                  src={product.images[0]?.src || '/placeholder.svg'} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <button 
                    className="bg-naaz-green text-white py-2 px-3 rounded-full text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                    onClick={(e) => handleQuickAdd(product, e)}
                  >
                    <ShoppingCart size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-naaz-green group-hover:text-naaz-gold transition-colors duration-300">{product.name}</h3>
                <p className="font-semibold mt-1 text-naaz-burgundy">
                  ₹{parseFloat(product.price).toLocaleString('en-IN')}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
