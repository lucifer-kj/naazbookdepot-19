import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { imageService } from '@/lib/services/imageService';

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
  responsive?: boolean;
  fallback?: string;
  loading?: 'lazy' | 'eager';
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  quality = 85,
  format,
  responsive = true,
  fallback = '/images/placeholder.jpg',
  loading = 'lazy',
  className,
  ...props
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Get optimized image URL
  const optimizedSrc = imageService.getOptimizedImageUrl(src, {
    width,
    height,
    quality,
    format
  });

  // Generate responsive URLs if needed
  const responsiveUrls = responsive ? imageService.getResponsiveImageUrls(src) : null;

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const imageSrc = imageError ? fallback : optimizedSrc;

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading placeholder */}
      {!imageLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <svg
            className="w-8 h-8 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}

      {/* Main image */}
      {responsive && responsiveUrls ? (
        <picture>
          <source
            media="(max-width: 400px)"
            srcSet={responsiveUrls.small}
          />
          <source
            media="(max-width: 800px)"
            srcSet={responsiveUrls.medium}
          />
          <source
            media="(max-width: 1200px)"
            srcSet={responsiveUrls.large}
          />
          <img
            src={imageSrc}
            alt={alt}
            width={width}
            height={height}
            loading={loading}
            onError={handleImageError}
            onLoad={handleImageLoad}
            className={cn(
              'transition-opacity duration-300',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            {...props}
          />
        </picture>
      ) : (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          onError={handleImageError}
          onLoad={handleImageLoad}
          className={cn(
            'transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}
    </div>
  );
}

// Preset image components for common use cases
export function ProductImage({ src, alt, ...props }: Omit<OptimizedImageProps, 'width' | 'height'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={400}
      height={400}
      quality={90}
      format="webp"
      {...props}
    />
  );
}

export function ThumbnailImage({ src, alt, ...props }: Omit<OptimizedImageProps, 'width' | 'height'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={150}
      height={150}
      quality={80}
      format="webp"
      responsive={false}
      {...props}
    />
  );
}

export function HeroImage({ src, alt, ...props }: Omit<OptimizedImageProps, 'width' | 'height'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={1200}
      height={600}
      quality={95}
      format="webp"
      {...props}
    />
  );
}

export function AvatarImage({ src, alt, ...props }: Omit<OptimizedImageProps, 'width' | 'height'>) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={100}
      height={100}
      quality={85}
      format="webp"
      responsive={false}
      className="rounded-full"
      {...props}
    />
  );
}
