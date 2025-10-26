import React, { useState, useEffect } from 'react';
import { OptimizedImage } from './OptimizedImage';

interface ImageWithCacheProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  quality?: number;
  sizes?: string;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
}

export function ImageWithCache({
  src,
  alt,
  quality = 80,
  sizes = '100vw',
  format = 'webp',
  ...props
}: ImageWithCacheProps) {
  const [imageUrl, setImageUrl] = useState<string>(src);

  useEffect(() => {
    const generateOptimizedUrl = () => {
      const url = new URL(src, window.location.origin);
      url.searchParams.set('quality', quality.toString());
      url.searchParams.set('format', format);
      
      // Add width parameter based on device pixel ratio
      const pixelRatio = window.devicePixelRatio || 1;
      const width = Math.round(window.innerWidth * pixelRatio);
      url.searchParams.set('width', width.toString());
      
      return url.toString();
    };

    setImageUrl(generateOptimizedUrl());

    // Update image URL on window resize
    const handleResize = () => {
      setImageUrl(generateOptimizedUrl());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [src, quality, format]);

  return (
    <OptimizedImage
      src={imageUrl}
      alt={alt}
      sizes={sizes}
      {...props}
    />
  );
}