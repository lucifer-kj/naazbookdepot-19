import { supabase } from '../supabase';
import { env, getFileUploadConfig } from '../config/env';
import sentryService from './sentryService';

export interface ImageUploadOptions {
  bucket?: string;
  folder?: string;
  maxSize?: number;
  allowedTypes?: string[];
  generateThumbnail?: boolean;
}

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  publicUrl?: string;
  path?: string;
  error?: string;
}

class ImageService {
  private defaultBucket = 'images';
  private config = getFileUploadConfig();

  /**
   * Upload an image to Supabase Storage
   */
  async uploadImage(
    file: File,
    fileName: string,
    options: ImageUploadOptions = {}
  ): Promise<ImageUploadResult> {
    try {
      const {
        bucket = this.defaultBucket,
        folder = 'uploads',
        maxSize = this.config.maxSize,
        allowedTypes = this.config.allowedTypes,
      } = options;

      // Validate file
      const validation = this.validateFile(file, { maxSize, allowedTypes });
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const uniqueFileName = `${fileName}_${timestamp}.${extension}`;
      const filePath = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: publicUrlData.publicUrl,
        publicUrl: publicUrlData.publicUrl,
        path: filePath
      };

    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Image upload failed'),
        {
          action: 'upload_image',
          additionalData: { fileName, options }
        }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Delete an image from Supabase Storage
   */
  async deleteImage(filePath: string, bucket: string = this.defaultBucket): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Image deletion failed'),
        {
          action: 'delete_image',
          additionalData: { filePath, bucket }
        }
      );
      return false;
    }
  }

  /**
   * Get optimized image URL with transformations
   */
  getOptimizedImageUrl(
    originalUrl: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpg' | 'png';
    } = {}
  ): string {
    if (!originalUrl) return '';

    // If using Supabase Storage, we can add transformation parameters
    if (originalUrl.includes('supabase.co/storage')) {
      const url = new URL(originalUrl);
      
      if (options.width) url.searchParams.set('width', options.width.toString());
      if (options.height) url.searchParams.set('height', options.height.toString());
      if (options.quality) url.searchParams.set('quality', options.quality.toString());
      if (options.format) url.searchParams.set('format', options.format);
      
      return url.toString();
    }

    // For other CDNs, return original URL
    return originalUrl;
  }

  /**
   * Get CDN URL for a file path
   */
  getCdnUrl(filePath: string, bucket: string = this.defaultBucket): string {
    if (!filePath) return '';

    // If it's already a full URL, return as is
    if (filePath.startsWith('http')) {
      return filePath;
    }

    // Use Supabase Storage public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Generate responsive image URLs for different screen sizes
   */
  getResponsiveImageUrls(originalUrl: string): {
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    original: string;
  } {
    return {
      thumbnail: this.getOptimizedImageUrl(originalUrl, { width: 150, height: 150, quality: 80 }),
      small: this.getOptimizedImageUrl(originalUrl, { width: 400, quality: 85 }),
      medium: this.getOptimizedImageUrl(originalUrl, { width: 800, quality: 90 }),
      large: this.getOptimizedImageUrl(originalUrl, { width: 1200, quality: 95 }),
      original: originalUrl
    };
  }

  /**
   * Validate file before upload
   */
  private validateFile(
    file: File,
    options: { maxSize: number; allowedTypes: string[] }
  ): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > options.maxSize) {
      return {
        isValid: false,
        error: `File size must be less than ${Math.round(options.maxSize / 1024 / 1024)}MB`
      };
    }

    // Check file type
    if (!options.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type must be one of: ${options.allowedTypes.join(', ')}`
      };
    }

    return { isValid: true };
  }

  /**
   * Create image buckets if they don't exist
   */
  async initializeBuckets(): Promise<void> {
    try {
      const buckets = ['images', 'thumbnails', 'products', 'avatars'];
      
      for (const bucketName of buckets) {
        const { data: existingBucket } = await supabase.storage.getBucket(bucketName);
        
        if (!existingBucket) {
          await supabase.storage.createBucket(bucketName, {
            public: true,
            allowedMimeTypes: this.config.allowedTypes,
            fileSizeLimit: this.config.maxSize
          });
        }
      }
    } catch (error) {
      import('../utils/consoleMigration').then(({ logWarning }) => {
        logWarning('Failed to initialize storage buckets', { error });
      });
    }
  }
}

// Create singleton instance
export const imageService = new ImageService();

// Initialize buckets on service creation
imageService.initializeBuckets();

export default imageService;