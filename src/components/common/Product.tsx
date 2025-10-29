
// Product component for displaying individual product cards
import { Link } from 'react-router-dom';
import { Heart, Star, ShoppingCart, Edit, Package } from 'lucide-react';
import { useAddToCart } from '@/lib/hooks/useCart';
import { useAddToWishlist, useRemoveFromWishlist, useCheckWishlistStatus } from '@/lib/hooks/useWishlist';
import { useCartContext } from '@/lib/context/CartContext';
import { useAuth } from '@/lib/context/AuthContext';
import type { Tables } from '@/integrations/supabase/types';

export interface ProductData extends Tables<'products'> {
  categories?: Tables<'categories'>;
  average_rating?: number;
  review_count?: number;
}

export interface ProductProps {
  product: ProductData;
  variant?: 'default' | 'featured' | 'admin' | 'compact';
  showAddToCart?: boolean;
  showWishlist?: boolean;
  showRating?: boolean;
  showStock?: boolean;
  showEditButton?: boolean;
  onEdit?: (product: ProductData) => void;
  className?: string;
}

const Product: React.FC<ProductProps> = ({
  product,
  variant = 'default',
  showAddToCart = true,
  showWishlist = true,
  showRating = true,
  showStock = false,
  showEditButton = false,
  onEdit,
  className = ''
}) => {
  const { isAuthenticated } = useAuth();
  const { addItem, isLoading: cartLoading } = useCartContext();
  const addToCart = useAddToCart();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const { data: isInWishlist } = useCheckWishlistStatus(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAuthenticated) {
      addToCart.mutate({
        productId: product.id,
        quantity: 1,
      });
    } else {
      await addItem({
        productId: product.id,
        name: product.name,
        price: product.price.toString(),
        image: product.images?.[0] || '/placeholder.svg'
      });
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) return;
    
    if (isInWishlist) {
      removeFromWishlist.mutate(product.id);
    } else {
      addToWishlist.mutate({ productId: product.id });
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(product);
  };

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'featured':
        return {
          container: 'bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2',
          image: 'w-40 h-48 mx-auto',
          content: 'p-6 text-center',
          title: 'font-playfair font-semibold text-xl text-naaz-green mb-2 group-hover:text-naaz-gold transition-colors',
          price: 'text-naaz-green font-bold text-xl'
        };
      case 'compact':
        return {
          container: 'bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300',
          image: 'w-full h-32',
          content: 'p-3',
          title: 'font-semibold text-sm text-gray-900 mb-1',
          price: 'text-naaz-green font-bold text-sm'
        };
      case 'admin':
        return {
          container: 'bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow duration-300',
          image: 'w-full h-40',
          content: 'p-4',
          title: 'font-semibold text-lg text-gray-900 mb-2',
          price: 'text-naaz-green font-bold text-lg'
        };
      default:
        return {
          container: 'bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300',
          image: 'w-full h-48',
          content: 'p-4',
          title: 'font-semibold text-lg text-gray-900 mb-2',
          price: 'text-naaz-green font-bold text-lg'
        };
    }
  };

  const styles = getVariantStyles();
  const imageUrl = product.images?.[0] || '/placeholder.svg';
  const isOutOfStock = product.stock <= 0;

  return (
    <div className={`group ${styles.container} ${className} ${isOutOfStock ? 'opacity-75' : ''}`}>
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden rounded-lg mb-4">
          <img 
            src={imageUrl} 
            alt={product.name}
            className={`${styles.image} object-cover transition-transform duration-500 group-hover:scale-110`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
          {variant === 'featured' && (
            <div className="absolute inset-0 bg-gradient-to-t from-naaz-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          )}
        </div>
      </Link>
      
      <div className={styles.content}>
        <Link to={`/product/${product.id}`}>
          <h3 className={`${styles.title} hover:text-naaz-gold transition-colors line-clamp-2`}>
            {product.name}
          </h3>
        </Link>
        
        {product.categories && (
          <p className="text-gray-600 text-sm mb-2">{product.categories.name}</p>
        )}
        
        {product.description && variant !== 'compact' && (
          <p className="text-gray-500 text-xs mb-3 line-clamp-2">{product.description}</p>
        )}
        
        {showRating && (
          <div className="flex items-center justify-center mb-3">
            <div className="flex text-naaz-gold mr-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={variant === 'compact' ? 12 : 16} 
                  className={i < Math.floor(product.average_rating || 0) ? 'fill-current' : ''} 
                />
              ))}
            </div>
            <span className="text-gray-600 text-xs">
              ({product.review_count || 0})
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <p className={styles.price}>₹{product.price.toLocaleString()}</p>
          {showStock && (
            <div className="flex items-center text-xs text-gray-600">
              <Package size={12} className="mr-1" />
              {product.stock}
            </div>
          )}
        </div>
        
        <div className={`flex gap-2 ${variant === 'compact' ? 'flex-col' : ''}`}>
          {showAddToCart && (
            <button 
              onClick={handleAddToCart}
              disabled={isOutOfStock || addToCart.isPending || cartLoading}
              className={`flex-1 bg-naaz-green text-white px-3 py-2 rounded-lg hover:bg-naaz-green/90 transition-all duration-300 transform hover:scale-105 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed ${
                variant === 'compact' ? 'text-xs' : 'text-sm'
              }`}
            >
              {(addToCart.isPending || cartLoading) ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-1"></div>
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart size={variant === 'compact' ? 12 : 16} className="mr-1" />
                  Add to Cart
                </>
              )}
            </button>
          )}
          
          {showWishlist && isAuthenticated && (
            <button 
              onClick={handleWishlist}
              disabled={addToWishlist.isPending || removeFromWishlist.isPending}
              className="p-2 text-gray-600 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              {(addToWishlist.isPending || removeFromWishlist.isPending) ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
              ) : (
                <Heart 
                  size={variant === 'compact' ? 16 : 20} 
                  className={isInWishlist ? 'fill-red-500 text-red-500' : ''} 
                />
              )}
            </button>
          )}
          
          {showEditButton && (
            <button 
              onClick={handleEdit}
              className="p-2 text-gray-600 hover:text-naaz-green transition-colors"
            >
              <Edit size={variant === 'compact' ? 16 : 20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
