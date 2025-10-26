import { useState, useEffect } from 'react';

interface UseImageLoaderOptions {
  src: string;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  width?: number;
  height?: number;
}

export function useImageLoader({
  src,
  quality = 80,
  format = 'webp',
  width,
  height
}: UseImageLoaderOptions) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [optimizedUrl, setOptimizedUrl] = useState<string>(src);

  useEffect(() => {
    const generateOptimizedUrl = () => {
      const url = new URL(src, window.location.origin);
      url.searchParams.set('quality', quality.toString());
      url.searchParams.set('format', format);

      if (width) {
        url.searchParams.set('width', width.toString());
      }
      if (height) {
        url.searchParams.set('height', height.toString());
      }

      return url.toString();
    };

    const preloadImage = async () => {
      try {
        setLoading(true);
        const url = generateOptimizedUrl();
        
        // Create a promise that resolves when the image loads
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.src = url;
          img.onload = resolve;
          img.onerror = reject;
        });

        setOptimizedUrl(url);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load image'));
      } finally {
        setLoading(false);
      }
    };

    preloadImage();
  }, [src, quality, format, width, height]);

  return {
    loading,
    error,
    optimizedUrl
  };
}