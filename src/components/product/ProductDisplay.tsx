import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import ProductGrid from './ProductGrid';
import { useCartContext } from '@/lib/context/CartContext';
import { toast } from 'sonner';

export interface Product {
  id: number;
  name: string;
  description: string;
  short_description?: string;
  price: string;
  regular_price?: string;
  sale_price?: string;
  stock_status: 'instock' | 'outofstock';
  average_rating: string;
  rating_count: number;
  categories: {
    id: number;
    name: string;
    slug: string;
  }[];
  images: {
    id: number;
    src: string;
    alt: string;
  }[];
  attributes?: {
    name: string;
    options: string[];
  }[];
  variations?: {
    id: number;
    name: string;
    price: string;
    stock_status: 'instock' | 'outofstock';
    attributes: {
      name: string;
      value: string;
    }[];
  }[];
  related_ids?: number[];
  quantity_in_stock: number;
}

interface ProductDisplayProps {
  product: Product;
  relatedProducts: Product[];
  reviews: any[];
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({ product, relatedProducts, reviews }) => {
  const { addItem } = useCartContext();

  const handleAddToCart = () => {
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
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <motion.div 
            className="relative overflow-hidden rounded-lg shadow-md"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <img 
              src={product.images[0]?.src || '/placeholder.svg'} 
              alt={product.name} 
              className="w-full h-auto object-cover" 
            />
          </motion.div>
          <div className="mt-4 flex overflow-x-auto">
            {product.images.map((image) => (
              <motion.img
                key={image.id}
                src={image.src}
                alt={image.alt}
                className="w-20 h-20 object-cover rounded-md mr-2 cursor-pointer"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-playfair font-semibold text-naaz-green mb-2">{product.name}</h1>
          <div className="flex items-center mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={20} 
                  className={star <= parseFloat(product.average_rating)
                    ? "text-naaz-gold fill-naaz-gold" 
                    : "text-gray-300"
                  }
                />
              ))}
            </div>
            <span className="text-gray-500 ml-2">({product.rating_count} ratings)</span>
          </div>
          <div className="mb-4">
            {product.sale_price ? (
              <>
                <span className="text-xl font-semibold text-naaz-green mr-2">₹{product.sale_price}</span>
                <span className="text-gray-500 line-through">₹{product.regular_price}</span>
              </>
            ) : (
              <span className="text-xl font-semibold text-naaz-green">₹{product.price}</span>
            )}
          </div>
          <div className="mb-6">
            <ReactMarkdown>{product.short_description || 'No short description available.'}</ReactMarkdown>
          </div>
          
          {/* Attributes */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Options</h3>
              {product.attributes.map((attr) => (
                <div key={attr.name} className="mb-3">
                  <p className="font-medium text-gray-600">{attr.name}:</p>
                  <div className="flex space-x-2">
                    {attr.options.map((option) => (
                      <button
                        key={option}
                        className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <motion.button 
            className="gold-button"
            onClick={handleAddToCart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add to Cart
          </motion.button>
        </div>
      </div>

      {/* Product Description */}
      <div className="mt-12">
        <h2 className="text-2xl font-playfair font-semibold text-naaz-green mb-4">Description</h2>
        <div className="text-gray-700 leading-relaxed">
          <ReactMarkdown>{product.description}</ReactMarkdown>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-playfair font-semibold text-naaz-green mb-4">Related Products</h2>
          <ProductGrid products={relatedProducts} />
        </div>
      )}

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-playfair font-semibold text-naaz-green mb-4">Reviews</h2>
          {reviews.map((review) => (
            <div key={review.id} className="mb-6 p-4 rounded-md shadow-sm bg-white">
              <div className="flex items-center mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={16} 
                      className={star <= review.rating
                        ? "text-naaz-gold fill-naaz-gold" 
                        : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-gray-500 ml-2">({review.rating})</span>
              </div>
              <p className="text-gray-700 italic mb-2">"{review.review}"</p>
              <p className="text-gray-600">- {review.reviewer_name}, {new Date(review.date_created).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductDisplay;
