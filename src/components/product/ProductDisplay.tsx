
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

const ProductDisplay: React.FC<ProductDisplayProps> = ({ product, relatedProducts, reviews }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="aspect-square mb-4">
        <img 
          src={product.images[0]?.src || '/placeholder.svg'} 
          alt={product.images[0]?.alt || product.name}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <h3 className="font-playfair font-semibold text-lg mb-2 text-naaz-green">{product.name}</h3>
      {product.author && (
        <p className="text-gray-600 text-sm mb-1">by {product.author}</p>
      )}
      <p className="text-gray-600 text-sm mb-2">{product.short_description || product.description}</p>
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
        <button className="bg-naaz-green text-white px-4 py-2 rounded hover:bg-naaz-green/90 transition-colors">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductDisplay;
