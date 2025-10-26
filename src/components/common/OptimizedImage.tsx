import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  quality?: number;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/placeholder-image.jpg',
  quality = 75,
  sizes = '100vw',
  className,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImgSrc(src);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    setImgSrc(fallbackSrc);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Generate srcset for responsive images
  const generateSrcSet = () => {
    const widths = [320, 640, 768, 1024, 1280, 1536];
    return widths
      .map((width) => {
        const imageUrl = new URL(src, window.location.origin);
        imageUrl.searchParams.set('width', width.toString());
        imageUrl.searchParams.set('quality', quality.toString());
        return `${imageUrl.toString()} ${width}w`;
      })
      .join(', ');
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      <img
        src={imgSrc}
        alt={alt}
        srcSet={generateSrcSet()}
        sizes={sizes}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        {...props}
      />
    </div>
  );
}