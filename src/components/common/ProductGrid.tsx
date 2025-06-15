
import React from 'react';
import Product, { ProductData, ProductProps } from './Product';

interface ProductGridProps {
  products: ProductData[];
  loading?: boolean;
  variant?: ProductProps['variant'];
  showAddToCart?: boolean;
  showWishlist?: boolean;
  showRating?: boolean;
  showStock?: boolean;
  showEditButton?: boolean;
  onEdit?: (product: ProductData) => void;
  gridCols?: 'auto' | 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  variant = 'default',
  showAddToCart = true,
  showWishlist = true,
  showRating = true,
  showStock = false,
  showEditButton = false,
  onEdit,
  gridCols = 'auto',
  className = ''
}) => {
  const getGridClasses = () => {
    if (gridCols === 'auto') {
      return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6';
    }
    
    const colsMap = {
      1: 'grid grid-cols-1 gap-6',
      2: 'grid grid-cols-1 sm:grid-cols-2 gap-6',
      3: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6',
      4: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6',
      5: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6',
      6: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6'
    };
    
    return colsMap[gridCols];
  };

  if (loading) {
    return (
      <div className={`${getGridClasses()} ${className}`}>
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="flex justify-between">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found.</p>
      </div>
    );
  }

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {products.map((product) => (
        <Product
          key={product.id}
          product={product}
          variant={variant}
          showAddToCart={showAddToCart}
          showWishlist={showWishlist}
          showRating={showRating}
          showStock={showStock}
          showEditButton={showEditButton}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
