
export interface Product {
  id: number;
  name: string;
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
  quantity_in_stock: number;
}

interface ProductDisplayProps {
  product: Product;
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({ product }) => {
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
      <p className="text-gray-600 text-sm mb-2">{product.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-xl font-bold text-naaz-gold">₹{product.price}</span>
        <span className={`text-sm ${product.stock_status === 'instock' ? 'text-green-600' : 'text-red-600'}`}>
          {product.stock_status === 'instock' ? 'In Stock' : 'Out of Stock'}
        </span>
      </div>
    </div>
  );
};

export default ProductDisplay;
