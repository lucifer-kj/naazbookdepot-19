import React, { useState, useRef, useEffect } from 'react';
import { imageOptimizationService, ResponsiveImageSet } from '@/lib/services/imageOptimizationService';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  lazy?: boolean;
  responsive?: boolean;
  imageSet?: ResponsiveImageSet;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  quality = 85,
  priority = false,
  lazy = true,
  responsive = true,
  imageSet,
  sizes,
  onLoad,
  onError,
  fallbackSrc = '/placeholder.svg',
  placeholder = 'blur',
  blurDataURL
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(priority ? src : '');
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(!lazy || priority);

  // Generate optimized URLs
  const optimizedSrc = imageOptimizationService.getOptimizedUrl(src, {
    width,
    height,
    quality,
    format: 'jpeg'
  });

  const webpSrc = imageOptimizationService.getOptimizedUrl(src, {
    width,
    height,
    quality: quality - 5,
    format: 'webp'
  });

  const avifSrc = imageOptimizationService.getOptimizedUrl(src, {
    width,
    height,
    quality: quality - 10,
    format: 'avif'
  });

  // Generate srcset and sizes
  const srcSet = imageSet 
    ? imageOptimizationService.generateSrcSet(imageSet, 'jpeg')
    : responsive 
      ? `${optimizedSrc} 1x, ${imageOptimizationService.getOptimizedUrl(src, { width: width ? width * 2 : undefined, height: height ? height * 2 : undefined, quality })} 2x`
      : undefined;

  const webpSrcSet = imageSet?.webp 
    ? imageOptimizationService.generateSrcSet(imageSet, 'webp')
    : responsive 
      ? `${webpSrc} 1x, ${imageOptimizationService.getOptimizedUrl(src, { width: width ? width * 2 : undefined, height: height ? height * 2 : undefined, quality: quality - 5, format: 'webp' })} 2x`
      : undefined;

  const avifSrcSet = imageSet?.avif 
    ? imageOptimizationService.generateSrcSet(imageSet, 'avif')
    : responsive 
      ? `${avifSrc} 1x, ${imageOptimizationService.getOptimizedUrl(src, { width: width ? width * 2 : undefined, height: height ? height * 2 : undefined, quality: quality - 10, format: 'avif' })} 2x`
      : undefined;

  const imageSizes = sizes || (responsive ? imageOptimizationService.generateSizes() : '');

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, isInView]);

  // Update src when in view
  useEffect(() => {
    if (isInView && !currentSrc) {
      setCurrentSrc(optimizedSrc);
    }
  }, [isInView, currentSrc, optimizedSrc]);

  // Preload critical images
  useEffect(() => {
    if (priority) {
      imageOptimizationService.preloadCriticalImages([optimizedSrc]);
    }
  }, [priority, optimizedSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setCurrentSrc(fallbackSrc);
    onError?.();
  };

  // Generate blur placeholder
  const blurPlaceholder = blurDataURL || (placeholder === 'blur' 
    ? `data:image/svg+xml;base64,${btoa(`
        <svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad)" />
        </svg>
      `)}`
    : undefined);

  const imageClasses = cn(
    'transition-opacity duration-300',
    {
      'opacity-0': !isLoaded && !hasError,
      'opacity-100': isLoaded || hasError,
    },
    className
  );

  const containerClasses = cn(
    'relative overflow-hidden',
    {
      'bg-gray-100': placeholder === 'blur' && !isLoaded,
    }
  );

  return (
    <div className={containerClasses}>
      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && blurPlaceholder && (
        <img
          src={blurPlaceholder}
          alt=""
          className={cn(
            'absolute inset-0 w-full h-full object-cover',
            'filter blur-sm scale-110'
          )}
          aria-hidden="true"
        />
      )}

      {/* Main image with modern format support */}
      <picture>
        {/* AVIF format (best compression) */}
        {avifSrcSet && (
          <source
            srcSet={isInView ? avifSrcSet : undefined}
            sizes={imageSizes}
            type="image/avif"
          />
        )}
        
        {/* WebP format (good compression, wide support) */}
        {webpSrcSet && (
          <source
            srcSet={isInView ? webpSrcSet : undefined}
            sizes={imageSizes}
            type="image/webp"
          />
        )}
        
        {/* JPEG fallback */}
        <img
          ref={imgRef}
          src={currentSrc}
          srcSet={isInView ? srcSet : undefined}
          sizes={imageSizes}
          alt={alt}
          width={width}
          height={height}
          className={imageClasses}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          style={{
            aspectRatio: width && height ? `${width} / ${height}` : undefined,
          }}
        />
      </picture>

      {/* Loading indicator */}
      {!isLoaded && !hasError && isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-naaz-green rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
