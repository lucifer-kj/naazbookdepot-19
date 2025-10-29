import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse rounded-md bg-gray-200 dark:bg-gray-800",
          className
        )}
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";

// Product Card Skeleton
const ProductCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("space-y-3", className)}>
    <Skeleton className="h-48 w-full rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-6 w-1/4" />
    </div>
    <Skeleton className="h-10 w-full rounded-md" />
  </div>
);

// Product Grid Skeleton
const ProductGridSkeleton: React.FC<{ count?: number; className?: string }> = ({ 
  count = 8, 
  className 
}) => (
  <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

// Cart Item Skeleton
const CartItemSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("flex items-center space-x-4 py-4 border-b", className)}>
    <Skeleton className="h-16 w-16 rounded-lg" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="flex items-center space-x-2">
      <Skeleton className="h-8 w-8 rounded" />
      <Skeleton className="h-4 w-8" />
      <Skeleton className="h-8 w-8 rounded" />
    </div>
    <Skeleton className="h-8 w-8 rounded" />
  </div>
);

// Cart Summary Skeleton
const CartSummarySkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("bg-white rounded-lg shadow-md p-6", className)}>
    <Skeleton className="h-6 w-1/2 mb-6" />
    <div className="space-y-3 mb-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
    <Skeleton className="h-12 w-full rounded-lg" />
  </div>
);

// Order History Skeleton
const OrderHistorySkeleton: React.FC<{ count?: number; className?: string }> = ({ 
  count = 5, 
  className 
}) => (
  <div className={cn("space-y-4", className)}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="border rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    ))}
  </div>
);

// Search Results Skeleton
const SearchResultsSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("space-y-4", className)}>
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-8 w-32" />
    </div>
    <ProductGridSkeleton count={12} />
  </div>
);

// Category Sidebar Skeleton
const CategorySidebarSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("space-y-6", className)}>
    <div className="space-y-3">
      <Skeleton className="h-5 w-24" />
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
    <div className="space-y-3">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="h-6 w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  </div>
);

// Checkout Form Skeleton
const CheckoutFormSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("space-y-6", className)}>
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
    <div className="space-y-4">
      <Skeleton className="h-6 w-28" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-3">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export {
  Skeleton,
  ProductCardSkeleton,
  ProductGridSkeleton,
  CartItemSkeleton,
  CartSummarySkeleton,
  OrderHistorySkeleton,
  SearchResultsSkeleton,
  CategorySidebarSkeleton,
  CheckoutFormSkeleton
};
