
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ArrowLeft, Plus, Minus, Loader2 } from 'lucide-react';
import { useProduct } from '@/lib/hooks/useProducts';
import { useAddToWishlist, useCheckWishlistStatus } from '@/lib/hooks/useWishlist';
import { useAuth } from '@/lib/context/AuthContext';
import { useCartContext } from '@/lib/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductReviews from '@/components/product/ProductReviews';

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem, isLoading: cartLoading } = useCartContext();
  const { data: product, isLoading, error } = useProduct(id!);
  const { mutate: addToWishlist, isPending: isAddingToWishlist } = useAddToWishlist();
  const { data: isInWishlist } = useCheckWishlistStatus(id!);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="flex items-center space-x-3 text-naaz-green">
            <Loader2 className="animate-spin" size={32} />
            <span className="text-lg">Loading product details...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-naaz-green mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <button 
              onClick={() => navigate('/products')}
              className="bg-naaz-green text-white px-6 py-2 rounded-lg hover:bg-naaz-green/90 transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      for (let i = 0; i < quantity; i++) {
        await addItem({
          productId: product.id,
          name: product.name,
          price: product.price.toString(),
          image: product.images?.[0] || '/placeholder.svg'
        });
      }
      import('../lib/utils/consoleMigration').then(({ logInfo }) => {
        logInfo('Added items to cart successfully', { productId: product?.id, quantity });
      });
    } catch (error) {
      import('../lib/utils/consoleMigration').then(({ handleApiError }) => {
        handleApiError(error, 'add_to_cart', { productId: product?.id, quantity });
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/checkout');
  };

  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      navigate('/account');
      return;
    }
    
    if (!isInWishlist) {
      addToWishlist({ productId: product.id });
    }
  };

  const images = product.images?.length ? product.images : ['/placeholder.svg'];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-naaz-green hover:text-naaz-gold transition-colors mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Product Images */}
            <div>
              <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === selectedImageIndex ? 'border-naaz-green' : 'border-gray-200'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt="" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div>
              <h1 className="text-3xl font-playfair font-bold text-naaz-green mb-4">
                {product.name}
              </h1>

              {product.categories && (
                <p className="text-naaz-gold font-medium mb-4">{product.categories.name}</p>
              )}

              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={20} 
                      className={i < Math.floor(product.average_rating || 0) ? 'fill-current' : ''} 
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  ({product.average_rating?.toFixed(1) || '0.0'}) • {product.review_count || 0} reviews
                </span>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-naaz-gold">₹{product.price.toLocaleString()}</span>
              </div>

              {product.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-naaz-green mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              {product.stock > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-naaz-green mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 border border-gray-300 rounded-lg min-w-[60px] text-center font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={quantity >= product.stock}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isAddingToCart}
                  className="flex-1 bg-naaz-green text-white py-3 px-6 rounded-lg hover:bg-naaz-green/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} className="mr-2" />
                      Add to Cart
                    </>
                  )}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0 || isAddingToCart}
                  className="flex-1 bg-naaz-gold text-white py-3 px-6 rounded-lg hover:bg-naaz-gold/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              <button
                onClick={handleAddToWishlist}
                disabled={isInWishlist || isAddingToWishlist}
                className={`w-full py-3 px-6 rounded-lg transition-colors flex items-center justify-center ${
                  isInWishlist 
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                    : 'border border-naaz-green text-naaz-green hover:bg-naaz-green/5'
                }`}
              >
                <Heart size={20} className={`mr-2 ${isInWishlist ? 'fill-current' : ''}`} />
                {isInWishlist ? 'In Wishlist' : isAddingToWishlist ? 'Adding...' : 'Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>

        {/* Product Reviews Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProductReviews productId={id!} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductPage;
