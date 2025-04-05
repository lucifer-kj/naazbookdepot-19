
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

interface ProductProps {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

const ProductCard = ({ product }: { product: ProductProps }) => {
  return (
    <div className="product-card group">
      <div className="relative overflow-hidden h-64">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button className="bg-naaz-gold text-naaz-green py-2 px-4 rounded-md flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        </div>
        <div className="absolute top-2 left-2 bg-naaz-green text-white text-xs px-2 py-1 rounded">
          {product.category}
        </div>
      </div>
      <div className="p-4">
        <Link to={`/product/${product.id}`} className="hover:text-naaz-gold">
          <h3 className="font-playfair font-semibold mb-1">{product.name}</h3>
        </Link>
        <p className="text-naaz-burgundy font-semibold">₹{product.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

const FeaturedProducts = () => {
  const products = [
    {
      id: 1,
      name: 'Deluxe Quran with Tafsir',
      price: 1299,
      image: 'https://images.unsplash.com/photo-1584727638096-042c45049ebe?q=80&w=1200&auto=format&fit=crop',
      category: 'Books'
    },
    {
      id: 2,
      name: 'Musk Amber Attar',
      price: 799,
      image: 'https://images.unsplash.com/photo-1615219434533-b9c232b0a406?q=80&w=1200&auto=format&fit=crop',
      category: 'Perfumes'
    },
    {
      id: 3,
      name: 'Wooden Prayer Beads',
      price: 349,
      image: 'https://images.unsplash.com/photo-1585562355719-8e053c14c469?q=80&w=1200&auto=format&fit=crop',
      category: 'Essentials'
    },
    {
      id: 4,
      name: 'Premium Rose Attar',
      price: 899,
      image: 'https://images.unsplash.com/photo-1608571423902-ead5b9a3694e?q=80&w=1200&auto=format&fit=crop',
      category: 'Perfumes'
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-naaz-green mb-4">Featured Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Explore our selection of premium Islamic products from all our specialized shops.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/shop" className="gold-button">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
