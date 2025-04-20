
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartContext } from '@/lib/context/CartContext';
import { toast } from 'sonner';
import { Product } from './ProductDisplay';
import { useInventoryRealtime } from '@/lib/services/realtime-service';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

const ProductItem = ({ product }: { product: Product }) => {
  const { addItem } = useCartContext();
  // Use real-time inventory tracking
  const { isOutOfStock } = useInventoryRealtime(product.id.toString());
  
  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    // Check if product is out of stock
    if (isOutOfStock || product.quantity_in_stock <= 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0]?.src
    });
    
    toast.success(`${product.name} added to cart`);
  };

  const handleAddToWishlist = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toast.success(`${product.name} added to wishlist`);
  };
  
  return (
    <motion.div 
      key={product.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="product-card group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative">
          <div className="h-64 overflow-hidden">
            <img 
              src={product.images[0]?.src || '/placeholder.svg'} 
              alt={product.name}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
            <button 
              className={`p-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ${
                isOutOfStock || product.quantity_in_stock <= 0 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-naaz-green text-white'
              }`}
              onClick={handleAddToCart}
              disabled={isOutOfStock || product.quantity_in_stock <= 0}
              title={isOutOfStock || product.quantity_in_stock <= 0 ? "Out of stock" : "Add to cart"}
            >
              {isOutOfStock || product.quantity_in_stock <= 0 ? <AlertCircle size={18} /> : <ShoppingCart size={18} />}
            </button>
            <button 
              className="bg-white text-naaz-green p-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75"
              onClick={handleAddToWishlist}
              title="Add to wishlist"
            >
              <Heart size={18} />
            </button>
          </div>
          {product.sale_price && (
            <span className="absolute top-2 left-2 bg-naaz-burgundy text-white text-xs font-medium px-2 py-1 rounded">
              Sale
            </span>
          )}
          {(isOutOfStock || product.quantity_in_stock <= 0) && (
            <span className="absolute top-2 right-2 bg-gray-700 text-white text-xs font-medium px-2 py-1 rounded">
              Out of stock
            </span>
          )}
          {!isOutOfStock && product.quantity_in_stock > 0 && product.quantity_in_stock <= 5 && (
            <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded">
              Low stock
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="flex mb-1">
            {product.categories[0] && (
              <span className="text-xs text-gray-500 capitalize">{product.categories[0].name}</span>
            )}
          </div>
          <h3 className="text-lg font-playfair font-medium mb-1 text-naaz-green group-hover:text-naaz-gold transition-colors">
            {product.name}
          </h3>
          {parseFloat(product.average_rating) > 0 && (
            <div className="flex items-center mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    size={14} 
                    className={star <= parseFloat(product.average_rating)
                      ? "text-naaz-gold fill-naaz-gold" 
                      : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">
                ({product.rating_count})
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-naaz-green">
                ₹{parseFloat(product.price).toLocaleString('en-IN')}
              </span>
              {product.regular_price && product.sale_price && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  ₹{parseFloat(product.regular_price).toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const ProductGrid = ({ products, loading = false }: ProductGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-64 rounded-md mb-4"></div>
            <div className="bg-gray-200 h-5 rounded w-3/4 mb-2"></div>
            <div className="bg-gray-200 h-4 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-medium text-gray-600 mb-4">No products found</h3>
        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductItem key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
