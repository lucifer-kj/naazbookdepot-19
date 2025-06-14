
import React, { useState } from 'react';
import { Heart, Star, Share2, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useAddToCart } from '@/lib/hooks/useCart';
import { useAddToWishlist, useRemoveFromWishlist, useCheckWishlistStatus } from '@/lib/hooks/useWishlist';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import ProductReviews from './ProductReviews';
import type { Tables } from '@/integrations/supabase/types';

interface ProductDisplayProps {
  product: Tables<'products'> & {
    categories?: Tables<'categories'>;
    average_rating?: number;
    review_count?: number;
  };
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({ product }) => {
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { data: isInWishlist } = useCheckWishlistStatus(product.id);
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const averageRating = Number(product.average_rating) || 0;
  const reviewCount = Number(product.review_count) || 0;

  const handleAddToCart = () => {
    if (user) {
      addToCart.mutate({
        productId: product.id,
        quantity,
      });
    }
  };

  const handleWishlistToggle = () => {
    if (!user) return;
    
    if (isInWishlist) {
      removeFromWishlist.mutate(product.id);
    } else {
      addToWishlist.mutate({ productId: product.id });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg">
            <img
              src={product.images?.[selectedImage] || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-naaz-green' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                ({reviewCount} reviews)
              </span>
            </div>
            
            <p className="text-3xl font-bold text-naaz-green mb-4">
              ₹{product.price}
            </p>
            
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Quantity:
              </label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                {[...Array(Math.min(10, product.stock))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
              
              <span className="text-sm text-gray-600">
                {product.stock} in stock
              </span>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-naaz-green hover:bg-naaz-green/90"
                disabled={product.stock === 0 || !user}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              
              <Button
                onClick={handleWishlistToggle}
                variant="outline"
                className={isInWishlist ? 'text-red-500 border-red-500' : ''}
                disabled={!user}
              >
                <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
              </Button>
              
              <Button variant="outline">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {product.stock === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium">Out of Stock</p>
              <p className="text-red-600 text-sm">
                This item is currently unavailable.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Product Reviews */}
      <div className="mt-12">
        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
};

export default ProductDisplay;
