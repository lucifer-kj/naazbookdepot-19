
import React from 'react';
import { Heart, ShoppingCart, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartContext } from '@/lib/context/CartContext';
import { useAddToWishlist, useRemoveFromWishlist, useCheckWishlistStatus } from '@/lib/hooks/useWishlist';
import type { ProductWithCategory } from '@/lib/hooks/useProducts';

interface ProductDisplayProps {
  product: ProductWithCategory;
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({ product }) => {
  const { addItem } = useCartContext();
  const { mutate: addToWishlist } = useAddToWishlist();
  const { mutate: removeFromWishlist } = useRemoveFromWishlist();
  const { data: isInWishlist = false } = useCheckWishlistStatus(product.id);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image: Array.isArray(product.images) ? product.images[0] : product.images || '/placeholder.svg'
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
        className={`h-5 w-5 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const imageUrl = Array.isArray(product.images) && product.images.length > 0 
    ? product.images[0] 
    : '/placeholder.svg';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-gray-900 mb-2">
            {product.name}
          </h1>
          {product.categories && (
            <p className="text-lg text-gray-600">{product.categories.name}</p>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {renderStars(product.average_rating || 0)}
          </div>
          <span className="text-sm text-gray-600">
            {product.average_rating?.toFixed(1) || '0.0'} ({product.review_count || 0} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="text-3xl font-bold text-naaz-green">
          ₹{Number(product.price).toFixed(2)}
        </div>

        {/* Description */}
        {product.description && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Stock Status */}
        <div>
          {product.stock === 0 ? (
            <span className="text-red-600 font-medium">Out of Stock</span>
          ) : product.stock < 5 ? (
            <span className="text-orange-600 font-medium">
              Only {product.stock} left in stock!
            </span>
          ) : (
            <span className="text-green-600 font-medium">In Stock</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 bg-naaz-green hover:bg-naaz-green/90 disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to Cart
          </Button>
          
          <Button
            onClick={handleWishlistToggle}
            variant="outline"
            size="lg"
            className="px-6"
          >
            <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current text-red-500' : ''}`} />
          </Button>
        </div>

        {/* Features */}
        <div className="border-t pt-6 space-y-3">
          <div className="flex items-center space-x-3">
            <Truck className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600">Free shipping on orders over ₹500</span>
          </div>
          <div className="flex items-center space-x-3">
            <Shield className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600">Secure payment</span>
          </div>
          <div className="flex items-center space-x-3">
            <RotateCcw className="h-5 w-5 text-gray-400" />
            <span className="text-gray-600">30-day return policy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDisplay;
