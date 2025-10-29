import { useState, useCallback } from 'react';
import { imageService, ImageUploadOptions, ImageUploadResult } from '../services/imageService';
import { imageOptimizationService, ResponsiveImageSet } from '../services/imageOptimizationService';
import { toast } from 'sonner';

export interface UseImageUploadOptions extends ImageUploadOptions {
  onSuccess?: (result: EnhancedUploadResult) => void;
  onError?: (error: string) => void;
  showToast?: boolean;
  generateResponsive?: boolean;
  optimizeFormats?: boolean;
  quality?: number;
}

export interface EnhancedUploadResult extends ImageUploadResult {
  responsiveSet?: ResponsiveImageSet;
  optimizedFormats?: {
    webp?: string;
    avif?: string;
    jpeg?: string;
  };
}

export interface UseImageUploadReturn {
  uploadImage: (file: File, fileName: string) => Promise<EnhancedUploadResult>;
  uploading: boolean;
  progress: number;
  optimizationProgress: number;
  error: string | null;
  clearError: () => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const {
    onSuccess,
    onError,
    showToast = true,
    generateResponsive = false,
    optimizeFormats = true,
    quality = 85,
    ...uploadOptions
  } = options;

  const uploadImage = useCallback(async (
    file: File,
    fileName: string
  ): Promise<EnhancedUploadResult> => {
    setUploading(true);
    setProgress(0);
    setOptimizationProgress(0);
    setError(null);

    try {
      // Step 1: Basic upload (30% progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 3, 30));
      }, 100);

      const basicResult = await imageService.uploadImage(file, fileName, uploadOptions);
      clearInterval(progressInterval);
      setProgress(30);

      if (!basicResult.success) {
        const errorMessage = basicResult.error || 'Upload failed';
        setError(errorMessage);
        if (showToast) {
          toast.error(errorMessage);
        }
        onError?.(errorMessage);
        return basicResult;
      }

      const result: EnhancedUploadResult = basicResult;

      // Step 2: Generate optimized formats if requested
      if (optimizeFormats) {
        setOptimizationProgress(20);
        
        try {
          const fileBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(fileBuffer);

          const formats = await imageOptimizationService.generateOptimizedFormats(buffer, {
            quality
          });

          setOptimizationProgress(60);
          setProgress(60);

          // Upload optimized formats
          const formatUploads = await Promise.all([
            imageService.uploadImage(
              new File([new Uint8Array(formats.webp)], `${fileName}.webp`, { type: 'image/webp' }),
              `${fileName}_webp`,
              { ...uploadOptions, folder: `${uploadOptions.folder || 'uploads'}/webp` }
            ),
            imageService.uploadImage(
              new File([new Uint8Array(formats.avif)], `${fileName}.avif`, { type: 'image/avif' }),
              `${fileName}_avif`,
              { ...uploadOptions, folder: `${uploadOptions.folder || 'uploads'}/avif` }
            )
          ]);

          result.optimizedFormats = {
            jpeg: basicResult.url,
            webp: formatUploads[0].url,
            avif: formatUploads[1].url
          };

          setOptimizationProgress(80);
          setProgress(80);
        } catch (error) {
          import('../utils/consoleMigration').then(({ logWarning }) => {
            logWarning('Failed to generate optimized formats', { error });
          });
        }
      }

      // Step 3: Generate responsive images if requested
      if (generateResponsive) {
        try {
          const fileBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(fileBuffer);

          const responsiveSet = await imageOptimizationService.generateResponsiveImageSet(
            buffer,
            fileName,
            {
              bucket: uploadOptions.bucket,
              folder: `${uploadOptions.folder || 'uploads'}/responsive`
            }
          );

          result.responsiveSet = responsiveSet;
          setOptimizationProgress(100);
        } catch (error) {
          import('../utils/consoleMigration').then(({ logWarning }) => {
            logWarning('Failed to generate responsive images', { error });
          });
        }
      }

      setProgress(100);

      if (showToast) {
        toast.success('Image uploaded and optimized successfully!');
      }
      onSuccess?.(result);

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      if (showToast) {
        toast.error(errorMessage);
      }
      onError?.(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setUploading(false);
      setTimeout(() => {
        setProgress(0);
        setOptimizationProgress(0);
      }, 1000);
    }
  }, [uploadOptions, onSuccess, onError, showToast, generateResponsive, optimizeFormats, quality]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadImage,
    uploading,
    progress,
    optimizationProgress,
    error,
    clearError
  };
}

// Specialized hooks for different use cases
export function useProductImageUpload() {
  return useImageUpload({
    folder: 'products',
    bucket: 'products',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    generateResponsive: true,
    optimizeFormats: true,
    quality: 90
  });
}

export function useAvatarUpload() {
  return useImageUpload({
    folder: 'avatars',
    bucket: 'avatars',
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    generateResponsive: false,
    optimizeFormats: true,
    quality: 85
  });
}

export function useBlogImageUpload() {
  return useImageUpload({
    folder: 'blog',
    bucket: 'images',
    maxSize: 3 * 1024 * 1024, // 3MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    generateResponsive: true,
    optimizeFormats: true,
    quality: 85
  });
}
