
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className }) => {
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden", className)}>
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
};

interface SkeletonTableRowProps {
  columns: number;
  className?: string;
}

export const SkeletonTableRow: React.FC<SkeletonTableRowProps> = ({ columns, className }) => {
  return (
    <div className={cn("flex items-center space-x-4 p-4", className)}>
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton 
          key={index} 
          className={cn("h-4", index === 0 ? "w-1/6" : "w-full")} 
        />
      ))}
    </div>
  );
};

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
  showHeader?: boolean;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({ 
  rows = 5, 
  columns = 4, 
  className,
  showHeader = true 
}) => {
  return (
    <div className={cn("rounded-md border", className)}>
      {showHeader && (
        <div className="bg-muted/50 p-4">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton 
                key={index} 
                className={cn("h-5", index === 0 ? "w-1/6" : "w-full")} 
              />
            ))}
          </div>
        </div>
      )}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, index) => (
          <SkeletonTableRow key={index} columns={columns} />
        ))}
      </div>
    </div>
  );
};

interface SkeletonListProps {
  count?: number;
  className?: string;
  itemClassName?: string;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ 
  count = 3,
  className,
  itemClassName
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={cn("flex items-center space-x-4", itemClassName)}>
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
};
