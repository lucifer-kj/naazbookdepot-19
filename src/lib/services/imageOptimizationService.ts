import sharp from 'sharp';
import { imageService } from './imageService';
import sentryService from './sentryService';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  background?: string;
  progressive?: boolean;
  lossless?: boolean;
}

export interface ResponsiveImageSet {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  xlarge: string;
  original: string;
  webp?: {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    xlarge: string;
  };
  avif?: {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    xlarge: string;
  };
}

export interface OptimizedImageResult {
  success: boolean;
  url?: string;
  formats?: {
    webp?: string;
    avif?: string;
    jpeg?: string;
  };
  error?: string;
}

class ImageOptimizationService {
  private readonly breakpoints = {
    thumbnail: 150,
    small: 400,
    medium: 800,
    large: 1200,
    xlarge: 1600
  };

  private readonly defaultQuality = {
    jpeg: 85,
    webp: 80,
    avif: 75,
    png: 90
  };

  /**
   * Optimize a single image with Sharp
   */
  async optimizeImage(
    input: Buffer | string,
    options: ImageOptimizationOptions = {}
  ): Promise<Buffer> {
    try {
      const {
        width,
        height,
        quality = this.defaultQuality.jpeg,
        format = 'jpeg',
        fit = 'cover',
        background = '#ffffff',
        progressive = true,
        lossless = false
      } = options;

      let pipeline = sharp(input);

      // Resize if dimensions provided
      if (width || height) {
        pipeline = pipeline.resize(width, height, {
          fit,
          background,
          withoutEnlargement: true
        });
      }

      // Apply format-specific optimizations
      switch (format) {
        case 'jpeg':
          pipeline = pipeline.jpeg({
            quality,
            progressive,
            mozjpeg: true
          });
          break;
        case 'webp':
          pipeline = pipeline.webp({
            quality,
            lossless,
            effort: 6
          });
          break;
        case 'avif':
          pipeline = pipeline.avif({
            quality,
            lossless,
            effort: 9
          });
          break;
        case 'png':
          pipeline = pipeline.png({
            quality,
            progressive,
            compressionLevel: 9,
            adaptiveFiltering: true
          });
          break;
      }

      return await pipeline.toBuffer();
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Image optimization failed'),
        {
          action: 'optimize_image',
          additionalData: { options }
        }
      );
      throw error;
    }
  }

  /**
   * Generate multiple optimized formats for a single image
   */
  async generateOptimizedFormats(
    input: Buffer | string,
    baseOptions: Omit<ImageOptimizationOptions, 'format'> = {}
  ): Promise<{
    jpeg: Buffer;
    webp: Buffer;
    avif: Buffer;
  }> {
    const [jpeg, webp, avif] = await Promise.all([
      this.optimizeImage(input, { ...baseOptions, format: 'jpeg' }),
      this.optimizeImage(input, { ...baseOptions, format: 'webp' }),
      this.optimizeImage(input, { ...baseOptions, format: 'avif' })
    ]);

    return { jpeg, webp, avif };
  }

  /**
   * Generate responsive image set with multiple sizes and formats
   */
  async generateResponsiveImageSet(
    input: Buffer | string,
    fileName: string,
    uploadOptions: { bucket?: string; folder?: string } = {}
  ): Promise<ResponsiveImageSet> {
    try {
      const { bucket = 'images', folder = 'optimized' } = uploadOptions;
      const baseFileName = fileName.replace(/\.[^/.]+$/, '');
      
      const results: ResponsiveImageSet = {
        thumbnail: '',
        small: '',
        medium: '',
        large: '',
        xlarge: '',
        original: '',
        webp: {
          thumbnail: '',
          small: '',
          medium: '',
          large: '',
          xlarge: ''
        },
        avif: {
          thumbnail: '',
          small: '',
          medium: '',
          large: '',
          xlarge: ''
        }
      };

      // Generate all size variants
      const sizePromises = Object.entries(this.breakpoints).map(async ([size, width]) => {
        const formats = await this.generateOptimizedFormats(input, {
          width,
          fit: 'cover'
        });

        // Upload each format
        const uploadPromises = Object.entries(formats).map(async ([format, buffer]) => {
          const file = new File([new Uint8Array(buffer)], `${baseFileName}_${size}.${format}`, {
            type: `image/${format}`
          });
          
          const result = await imageService.uploadImage(
            file,
            `${baseFileName}_${size}`,
            { bucket, folder: `${folder}/${format}` }
          );

          return { size, format, url: result.url || '' };
        });

        return Promise.all(uploadPromises);
      });

      const allUploads = await Promise.all(sizePromises);
      
      // Organize results by size and format
      allUploads.flat().forEach(({ size, format, url }) => {
        if (format === 'jpeg') {
          results[size as keyof typeof this.breakpoints] = url;
        } else if (format === 'webp' && results.webp) {
          results.webp[size as keyof typeof this.breakpoints] = url;
        } else if (format === 'avif' && results.avif) {
          results.avif[size as keyof typeof this.breakpoints] = url;
        }
      });

      // Upload original
      const originalFile = new File([new Uint8Array(input as Buffer)], `${baseFileName}_original.jpg`, {
        type: 'image/jpeg'
      });
      const originalResult = await imageService.uploadImage(
        originalFile,
        `${baseFileName}_original`,
        { bucket, folder }
      );
      results.original = originalResult.url || '';

      return results;
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Responsive image generation failed'),
        {
          action: 'generate_responsive_images',
          additionalData: { fileName, uploadOptions }
        }
      );
      throw error;
    }
  }

  /**
   * Get optimized image URL with CDN parameters
   */
  getOptimizedUrl(
    originalUrl: string,
    options: ImageOptimizationOptions = {}
  ): string {
    if (!originalUrl) return '';

    // If it's a Supabase URL, add transformation parameters
    if (originalUrl.includes('supabase.co/storage')) {
      const url = new URL(originalUrl);
      
      if (options.width) url.searchParams.set('width', options.width.toString());
      if (options.height) url.searchParams.set('height', options.height.toString());
      if (options.quality) url.searchParams.set('quality', options.quality.toString());
      if (options.format) url.searchParams.set('format', options.format);
      
      return url.toString();
    }

    // For external URLs, return as-is (could integrate with external CDN here)
    return originalUrl;
  }

  /**
   * Generate srcset string for responsive images
   */
  generateSrcSet(imageSet: ResponsiveImageSet, format: 'jpeg' | 'webp' | 'avif' = 'jpeg'): string {
    const urls = format === 'jpeg' ? imageSet : imageSet[format];
    if (!urls) return '';

    const srcsetEntries: string[] = [];
    
    Object.entries(this.breakpoints).forEach(([size, width]) => {
      const url = urls[size as keyof typeof urls];
      if (url) {
        srcsetEntries.push(`${url} ${width}w`);
      }
    });

    return srcsetEntries.join(', ');
  }

  /**
   * Generate sizes attribute for responsive images
   */
  generateSizes(breakpoints?: { [key: string]: string }): string {
    const defaultSizes = {
      '(max-width: 400px)': '100vw',
      '(max-width: 800px)': '50vw',
      '(max-width: 1200px)': '33vw',
      default: '25vw'
    };

    const sizes = breakpoints || defaultSizes;
    const sizeEntries: string[] = [];

    Object.entries(sizes).forEach(([condition, size]) => {
      if (condition === 'default') {
        sizeEntries.push(size);
      } else {
        sizeEntries.push(`${condition} ${size}`);
      }
    });

    return sizeEntries.join(', ');
  }

  /**
   * Lazy load images with Intersection Observer
   */
  setupLazyLoading(container?: HTMLElement): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without Intersection Observer
      this.loadAllImages(container);
      return;
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          this.loadImage(img);
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    const images = (container || document).querySelectorAll('img[data-src]');
    images.forEach(img => imageObserver.observe(img));
  }

  /**
   * Load a single lazy image
   */
  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    if (src) {
      img.src = src;
      img.removeAttribute('data-src');
    }

    if (srcset) {
      img.srcset = srcset;
      img.removeAttribute('data-srcset');
    }

    img.classList.add('loaded');
  }

  /**
   * Fallback to load all images immediately
   */
  private loadAllImages(container?: HTMLElement): void {
    const images = (container || document).querySelectorAll('img[data-src]');
    images.forEach(img => this.loadImage(img as HTMLImageElement));
  }

  /**
   * Preload critical images
   */
  preloadCriticalImages(urls: string[]): void {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  /**
   * Get image metadata using Sharp
   */
  async getImageMetadata(input: Buffer | string): Promise<{
    width: number;
    height: number;
    format: string;
    size: number;
    hasAlpha: boolean;
  }> {
    try {
      const metadata = await sharp(input).metadata();
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: metadata.size || 0,
        hasAlpha: metadata.hasAlpha || false
      };
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Failed to get image metadata'),
        { action: 'get_image_metadata' }
      );
      throw error;
    }
  }
}

// Create singleton instance
export const imageOptimizationService = new ImageOptimizationService();

export default imageOptimizationService;