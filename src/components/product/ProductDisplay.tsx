
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { useCartContext } from '@/lib/context/CartContext';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string[];
  categories: { id: string; name: string; }[];
  average_rating: number;
  review_count: number;
  stock: number;
}

interface ProductDisplayProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onAddToWishlist?: (productId: string) => void;
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({ 
  product, 
  onQuickView, 
  onAddToWishlist 
}) => {
  const { addItem } = useCartContext();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '/placeholder.svg'
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToWishlist?.(product.id);
  };

  const isInStock = product.stock > 0;

  return (
    <Link to={`/product/${product.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 group">
        <div className="relative overflow-hidden">
          <img
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Category Badge */}
          {product.categories[0] && (
            <div className="absolute top-2 left-2 bg-naaz-green text-white px-2 py-1 rounded text-xs">
              {product.categories[0].name}
            </div>
          )}
          
          {/* Stock Badge */}
          {!isInStock && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
              Out of Stock
            </div>
          )}
          
          {/* Quick Actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex gap-2">
              <button
                onClick={handleQuickView}
                className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Quick View"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={handleAddToWishlist}
                className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Add to Wishlist"
              >
                <Heart size={16} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-playfair font-semibold text-lg mb-1 text-naaz-green line-clamp-2">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
              {product.description}
            </p>
          )}
          
          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(product.average_rating) ? 'text-yellow-400' : 'text-gray-300'}>
                  ⭐
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-1">({product.review_count})</span>
          </div>
          
          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span className="text-xl font-bold text-naaz-gold">₹{product.price}</span>
            </div>
            <span className={`text-sm ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
              {isInStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
          
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!isInStock}
            className="w-full bg-naaz-green text-white py-2 px-4 rounded hover:bg-naaz-green/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <ShoppingCart size={16} className="mr-2" />
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductDisplay;
