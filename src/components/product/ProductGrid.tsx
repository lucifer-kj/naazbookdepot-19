
import React from 'react';
import ProductGrid from '@/components/common/ProductGrid';
import type { ProductWithCategory } from '@/lib/hooks/useProducts';

interface ProductGridProps {
  products: ProductWithCategory[];
  loading?: boolean;
}

const ProductGridWrapper: React.FC<ProductGridProps> = ({ products, loading = false }) => {
  return (
    <ProductGrid
      products={products}
      loading={loading}
      variant="default"
      showAddToCart={true}
      showWishlist={true}
      showRating={true}
      showStock={false}
    />
  );
};

export default ProductGridWrapper;
