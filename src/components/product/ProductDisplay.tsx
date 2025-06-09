import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useCartContext } from '@/lib/context/CartContext';
import { useNavigate } from 'react-router-dom';

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
}

interface ProductDisplayProps {
  product: Product;
  relatedProducts?: Product[];
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({ product }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null);
  const { addItem } = useCartContext();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    const selectedVar = product.variations?.find(v => v.id === selectedVariation);
    
    addItem({
      productId: product.id,
      variationId: selectedVar?.id?.toString(),
      name: product.name + (selectedVar ? ` - ${selectedVar.name}` : ''),
      price: selectedVar?.price || product.price,
      image: product.images[0]?.src || '/placeholder.svg'
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <motion.div 
            className="aspect-square rounded-lg overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <img
              src={product.images[selectedImage]?.src || '/placeholder.svg'}
              alt={product.images[selectedImage]?.alt || product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>
          
          <div className="grid grid-cols-4 gap-2">
            {product.images.length > 1 && product.images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square rounded-md overflow-hidden border-2 transition-colors ${
                  selectedImage === index 
                    ? 'border-naaz-green' 
                    : 'border-transparent hover:border-naaz-green/50'
                }`}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-playfair font-bold text-naaz-green mb-2">
              {product.name}
            </h1>
            {product.author && (
              <p className="text-gray-600">by {product.author}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`${
                    i < Math.floor(parseFloat(product.average_rating))
                      ? 'fill-current'
                      : 'stroke-current fill-none'
                  }`}
                  size={20}
                />
              ))}
            </div>
            <span className="text-gray-600">
              {product.rating_count} reviews
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-naaz-gold">
                ₹{selectedVariation 
                  ? product.variations?.find(v => v.id === selectedVariation)?.price 
                  : product.price
                }
              </span>
              {product.regular_price && (
                <span className="text-lg text-gray-500 line-through">
                  ₹{product.regular_price}
                </span>
              )}
            </div>
            <span className={`text-sm ${
              product.stock_status === 'instock' 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {product.stock_status === 'instock' 
                ? `In Stock (${product.quantity_in_stock} available)` 
                : 'Out of Stock'
              }
            </span>
          </div>

          {product.attributes && (
            <div className="space-y-4">
              {product.attributes.map((attr) => (
                <div key={attr.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {attr.name}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {attr.options.map((option) => (
                      <button
                        key={option}
                        className="px-4 py-2 border-2 rounded-md text-sm font-medium transition-colors hover:border-naaz-green hover:bg-naaz-green/5"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={product.stock_status === 'outofstock'}
              className="flex-1 bg-naaz-green text-white px-6 py-3 rounded-lg hover:bg-naaz-green/90 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock_status === 'outofstock'}
              className="flex-1 border-2 border-naaz-green text-naaz-green px-6 py-3 rounded-lg hover:bg-naaz-green hover:text-white transition-colors disabled:border-gray-400 disabled:text-gray-400"
            >
              Buy Now
            </button>
            <button
              className="p-3 border-2 border-naaz-green text-naaz-green rounded-lg hover:bg-naaz-green hover:text-white transition-colors"
            >
              <Heart size={20} />
            </button>
          </div>

          {product.short_description && (
            <div className="prose max-w-none">
              <p className="text-gray-600">{product.short_description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDisplay;
