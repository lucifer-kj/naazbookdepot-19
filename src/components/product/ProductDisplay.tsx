
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCartContext } from '@/lib/context/CartContext';

export interface Product {
  id: number;
  name: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  pages?: number;
  binding?: string;
  language?: string;
  publication_year?: number;
  price: string;
  regular_price?: string;
  sale_price?: string;
  stock_status: 'instock' | 'outofstock';
  average_rating: string;
  rating_count: number;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  images: Array<{
    id: number;
    src: string;
    alt: string;
  }>;
  description: string;
  short_description?: string;
  quantity_in_stock: number;
  attributes?: Array<{
    name: string;
    options: string[];
  }>;
  variations?: Array<{
    id: number;
    name: string;
    price: string;
    stock_status: 'instock' | 'outofstock';
    attributes: Array<{
      name: string;
      value: string;
    }>;
  }>;
  related_ids?: number[];
}

interface ProductDisplayProps {
  product: Product;
  relatedProducts?: Product[];
  reviews?: Array<{
    id: number;
    reviewer_name: string;
    review: string;
    rating: number;
    date_created: string;
    verified: boolean;
  }>;
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({ product }) => {
  const { addItem } = useCartContext();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.src || '/placeholder.svg'
    });
  };

  return (
    <Link to={`/product/${product.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
        <div className="aspect-square mb-4">
          <img 
            src={product.images[0]?.src || '/placeholder.svg'} 
            alt={product.images[0]?.alt || product.name}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <h3 className="font-playfair font-semibold text-lg mb-2 text-naaz-green line-clamp-2">{product.name}</h3>
        {product.author && (
          <p className="text-gray-600 text-sm mb-1">by {product.author}</p>
        )}
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.short_description || product.description}</p>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xl font-bold text-naaz-gold">₹{product.price}</span>
          <span className={`text-sm ${product.stock_status === 'instock' ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock_status === 'instock' ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.floor(parseFloat(product.average_rating)) ? 'text-yellow-400' : 'text-gray-300'}>
                  ⭐
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-1">({product.rating_count})</span>
          </div>
          <button 
            onClick={handleAddToCart}
            disabled={product.stock_status === 'outofstock'}
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
