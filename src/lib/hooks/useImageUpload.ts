import { useState, useCallback } from 'react';
import { imageService, ImageUploadOptions, ImageUploadResult } from '../services/imageService';
import { toast } from 'sonner';

export interface UseImageUploadOptions extends ImageUploadOptions {
  onSuccess?: (result: ImageUploadResult) => void;
  onError?: (error: string) => void;
  showToast?: boolean;
}

export interface UseImageUploadReturn {
  uploadImage: (file: File, fileName: string) => Promise<ImageUploadResult>;
  uploading: boolean;
  progress: number;
  error: string | null;
  clearError: () => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const {
    onSuccess,
    onError,
    showToast = true,
    ...uploadOptions
  } = options;

  const uploadImage = useCallback(async (
    file: File,
    fileName: string
  ): Promise<ImageUploadResult> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await imageService.uploadImage(file, fileName, uploadOptions);

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success) {
        if (showToast) {
          toast.success('Image uploaded successfully!');
        }
        onSuccess?.(result);
      } else {
        const errorMessage = result.error || 'Upload failed';
        setError(errorMessage);
        if (showToast) {
          toast.error(errorMessage);
        }
        onError?.(errorMessage);
      }

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
      setTimeout(() => setProgress(0), 1000);
    }
  }, [uploadOptions, onSuccess, onError, showToast]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    uploadImage,
    uploading,
    progress,
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
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  });
}

export function useAvatarUpload() {
  return useImageUpload({
    folder: 'avatars',
    bucket: 'avatars',
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  });
}

export function useBlogImageUpload() {
  return useImageUpload({
    folder: 'blog',
    bucket: 'images',
    maxSize: 3 * 1024 * 1024, // 3MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  });
}