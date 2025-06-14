import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/hooks/useCart';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { Button } from '@/components/ui/button';
import type { Tables } from '@/integrations/supabase/types';

interface ProductCardProps {
  product: Tables<'products'> & {
    categories?: Tables<'categories'>;
    average_rating?: number;
    review_count?: number;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Link to={`/product/${product.id}`}>
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-naaz-green transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center mt-2">
          <Star className="h-4 w-4 text-yellow-500 mr-1" />
          <span className="text-sm text-gray-700">{product.average_rating?.toFixed(1) || '0'} ({product.review_count || 0})</span>
        </div>
        <p className="mt-2 text-gray-600">₹{product.price.toLocaleString()}</p>
        <div className="mt-4 flex justify-between items-center">
          <Button size="sm" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
          <button onClick={handleWishlist} className="text-gray-600 hover:text-red-500 transition-colors">
            {isInWishlist(product.id) ? (
              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            ) : (
              <Heart className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
