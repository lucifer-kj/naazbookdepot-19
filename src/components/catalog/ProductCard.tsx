import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartContext } from '@/lib/context/CartContext';
import { useAddToWishlist, useRemoveFromWishlist, useCheckWishlistStatus } from '@/lib/hooks/useWishlist';
import type { ProductWithCategory } from '@/lib/hooks/useProducts';

interface ProductCardProps {
  product: ProductWithCategory;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCartContext();
  const { mutate: addToWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();
  const { data: isInWishlist = false } = useCheckWishlistStatus(product.id);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: typeof product.price === 'string' ? Number(product.price) : product.price,
      image: Array.isArray(product.images) ? String(product.images[0]) : String(product.images || '/placeholder.svg')
    });
  };

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        productId: product.id
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const imageUrl = Array.isArray(product.images) && product.images.length > 0 
    ? product.images[0] 
    : '/placeholder.svg';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 p-2 rounded-full ${
            isInWishlist
              ? 'bg-red-500 text-white'
              : 'bg-white text-gray-600 hover:text-red-500'
          } transition-colors`}
        >
          <Heart className="h-4 w-4" />
        </button>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-naaz-green transition-colors mb-2 line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {product.categories && (
          <p className="text-sm text-gray-600 mb-2">{product.categories.name}</p>
        )}

        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {renderStars(product.average_rating || 0)}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            ({product.review_count || 0})
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-naaz-green">
            ₹{Number(product.price).toFixed(2)}
          </span>
          
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-naaz-green hover:bg-naaz-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>

        {product.stock < 5 && product.stock > 0 && (
          <p className="text-sm text-orange-600 mt-2">
            Only {product.stock} left in stock!
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
