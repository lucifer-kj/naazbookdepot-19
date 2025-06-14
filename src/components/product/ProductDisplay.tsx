
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCartContext } from '@/lib/context/CartContext';

export interface Product {
  id: string;
  name: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  pages?: number;
  binding?: string;
  language?: string;
  publication_year?: number;
  price: number;
  regular_price?: string;
  sale_price?: string;
  stock: number;
  images?: string[];
  description: string;
  short_description?: string;
  categories?: {
    id: string;
    name: string;
    slug: string;
  };
  average_rating?: number;
  review_count?: number;
}

interface ProductDisplayProps {
  product: Product;
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({ product }) => {
  const { addItem } = useCartContext();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price.toString(),
      image: product.images?.[0] || '/placeholder.svg'
    });
  };

  const StarRating = ({ rating, count }: { rating: number; count: number }) => (
    <div className="flex items-center space-x-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-gray-500">
        ({rating.toFixed(1)}) {count} reviews
      </span>
    </div>
  );

  return (
    <Link to={`/product/${product.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
        <div className="aspect-square mb-4">
          <img 
            src={product.images?.[0] || '/placeholder.svg'} 
            alt={product.name}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <h3 className="font-playfair font-semibold text-lg mb-2 text-naaz-green line-clamp-2">
          {product.name}
        </h3>
        {product.author && (
          <p className="text-gray-600 text-sm mb-1">by {product.author}</p>
        )}
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {product.short_description || product.description}
        </p>
        
        {/* Rating */}
        {product.review_count && product.review_count > 0 && (
          <div className="mb-2">
            <StarRating rating={product.average_rating || 0} count={product.review_count} />
          </div>
        )}
        
        <div className="flex justify-between items-center mb-2">
          <span className="text-xl font-bold text-naaz-gold">₹{product.price}</span>
          <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {product.categories?.name}
          </div>
          <button 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="bg-naaz-green text-white px-4 py-2 rounded hover:bg-naaz-green/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            <ShoppingCart size={16} className="mr-1" />
            Add to Cart
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductDisplay;
