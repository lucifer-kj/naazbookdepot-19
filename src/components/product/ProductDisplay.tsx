
import React, { useState } from 'react';
import { useCartContext } from '@/lib/context/CartContext';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Plus, 
  Minus, 
  ChevronDown, 
  ChevronUp, 
  ZoomIn
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import Image from '../ui/image';
import { motion } from 'framer-motion';
import ProductReviews from './ProductReviews';
import RelatedProducts from './RelatedProducts';

export interface ProductVariation {
  id: number;
  name: string;
  price: string;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  attributes: {
    name: string;
    value: string;
  }[];
}

export interface Product {
  id: number;
  name: string;
  description: string;
  short_description?: string;
  price: string;
  regular_price?: string;
  sale_price?: string | null;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
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
  variations?: ProductVariation[];
  related_ids?: number[];
}

interface ProductDisplayProps {
  product: Product;
  relatedProducts?: Product[];
  reviews?: any[]; // Can be typed more specifically based on your review structure
}

const ProductDisplay = ({ product, relatedProducts = [], reviews = [] }: ProductDisplayProps) => {
  const { addItem } = useCartContext();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Format price with Indian Rupee symbol
  const formatPrice = (price: string) => {
    return `₹${parseFloat(price).toLocaleString('en-IN')}`;
  };

  // Handle quantity changes
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Handle attribute selection
  const handleAttributeChange = (name: string, value: string) => {
    setSelectedAttributes(prev => ({ ...prev, [name]: value }));
    
    // Find matching variation if applicable
    if (product.variations) {
      const matchingVariation = product.variations.find(variation => {
        const newAttributes = { ...selectedAttributes, [name]: value };
        return variation.attributes.every(attr => 
          newAttributes[attr.name] === attr.value
        );
      });
      
      setSelectedVariation(matchingVariation || null);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    const itemToAdd = {
      productId: product.id,
      name: product.name,
      price: selectedVariation ? selectedVariation.price : product.price,
      quantity: quantity,
      image: product.images[0]?.src,
      variationId: selectedVariation?.id,
      attributes: selectedVariation?.attributes
    };
    
    addItem(itemToAdd);
    toast.success(`${product.name} added to cart`);
  };

  // Handle wishlist
  const handleAddToWishlist = () => {
    toast.success(`${product.name} added to wishlist`);
  };

  // Handle share
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Product link copied to clipboard');
  };

  // Handle zoom toggle
  const handleZoomToggle = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Product Main Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Product Images */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className={`relative overflow-hidden rounded-lg ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}>
            <Image 
              src={product.images[selectedImage]?.src || '/placeholder.svg'} 
              alt={product.images[selectedImage]?.alt || product.name}
              className={`w-full object-cover transition-transform duration-500 ${isZoomed ? 'scale-150' : 'scale-100'}`}
              width={600}
              height={600}
              onClick={handleZoomToggle}
            />
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute top-2 right-2 bg-white/70 hover:bg-white"
              onClick={handleZoomToggle}
            >
              <ZoomIn size={20} />
            </Button>
          </div>
          
          {/* Thumbnail Gallery */}
          {product.images.length > 1 && (
            <div className="mt-4">
              <Carousel className="w-full">
                <CarouselContent>
                  {product.images.map((image, index) => (
                    <CarouselItem key={image.id} className="basis-1/5">
                      <div 
                        className={cn(
                          "cursor-pointer border-2 rounded overflow-hidden transition-all duration-300",
                          selectedImage === index ? "border-naaz-green" : "border-transparent hover:border-naaz-gold"
                        )}
                        onClick={() => setSelectedImage(index)}
                      >
                        <Image 
                          src={image.src} 
                          alt={image.alt || product.name}
                          className="w-full h-20 object-cover"
                          width={100}
                          height={100}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
              </Carousel>
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Categories */}
          <div className="flex gap-2 text-sm">
            {product.categories.map((category, index) => (
              <React.Fragment key={category.id}>
                <span className="text-gray-500 hover:text-naaz-green transition-colors cursor-pointer">
                  {category.name}
                </span>
                {index < product.categories.length - 1 && (
                  <span className="text-gray-400">/</span>
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Product Name */}
          <h1 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green">{product.name}</h1>
          
          {/* Ratings */}
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  size={18} 
                  className={star <= parseFloat(product.average_rating) 
                    ? "text-naaz-gold fill-naaz-gold" 
                    : "text-gray-300"
                  }
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              ({product.rating_count} {product.rating_count === 1 ? 'review' : 'reviews'})
            </span>
          </div>
          
          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-naaz-green">
              {formatPrice(selectedVariation ? selectedVariation.price : product.price)}
            </span>
            {product.regular_price && product.sale_price && (
              <span className="text-lg text-gray-500 line-through">
                {formatPrice(product.regular_price)}
              </span>
            )}
          </div>
          
          {/* Short Description */}
          {product.short_description && (
            <div 
              className="text-gray-700"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
          )}
          
          {/* Attributes/Variations */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="space-y-4">
              {product.attributes.map((attribute) => (
                <div key={attribute.name} className="space-y-2">
                  <h3 className="font-semibold">{attribute.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {attribute.options.map((option) => (
                      <button
                        key={option}
                        className={cn(
                          "px-4 py-2 border rounded-md transition-all duration-300",
                          selectedAttributes[attribute.name] === option
                            ? "border-naaz-green bg-naaz-green/10 text-naaz-green"
                            : "border-gray-300 hover:border-naaz-gold"
                        )}
                        onClick={() => handleAttributeChange(attribute.name, option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Quantity Selector */}
          <div className="flex items-center">
            <span className="mr-4 font-medium">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-md">
              <button 
                className="px-3 py-2 hover:bg-gray-100 transition-colors"
                onClick={decreaseQuantity}
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="px-4 py-2 border-l border-r border-gray-300 min-w-[40px] text-center">
                {quantity}
              </span>
              <button 
                className="px-3 py-2 hover:bg-gray-100 transition-colors"
                onClick={increaseQuantity}
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          {/* Stock Status */}
          <div>
            <span 
              className={cn(
                "font-medium",
                (selectedVariation?.stock_status || product.stock_status) === 'instock'
                  ? "text-green-600"
                  : (selectedVariation?.stock_status || product.stock_status) === 'outofstock'
                  ? "text-red-600"
                  : "text-amber-600"
              )}
            >
              {(selectedVariation?.stock_status || product.stock_status) === 'instock'
                ? "In Stock"
                : (selectedVariation?.stock_status || product.stock_status) === 'outofstock'
                ? "Out of Stock"
                : "Available on Backorder"}
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              className="gold-button flex-1 transition-transform duration-300 hover:scale-105"
              onClick={handleAddToCart}
              disabled={(selectedVariation?.stock_status || product.stock_status) === 'outofstock'}
            >
              <ShoppingCart size={18} className="mr-2" />
              Add to Cart
            </Button>
            
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                size="icon"
                className="border-naaz-green text-naaz-green hover:bg-naaz-green/10 transition-all"
                onClick={handleAddToWishlist}
              >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Heart size={20} />
                </motion.div>
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                className="border-naaz-green text-naaz-green hover:bg-naaz-green/10 transition-all"
                onClick={handleShare}
              >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Share2 size={20} />
                </motion.div>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Product Description */}
      <div className="mt-16">
        <div 
          className="border-t border-b border-gray-200 py-6 cursor-pointer"
          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-playfair font-bold text-naaz-green">Product Details</h2>
            {isDescriptionExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
        
        {isDescriptionExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="py-6"
          >
            <div 
              className="prose max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </motion.div>
        )}
      </div>
      
      {/* Reviews Section */}
      <ProductReviews productId={product.id} reviews={reviews} rating={parseFloat(product.average_rating)} />
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <RelatedProducts products={relatedProducts} />
      )}
    </div>
  );
};

export default ProductDisplay;
