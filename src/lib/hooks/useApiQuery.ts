import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiErrorHandler, ApiError } from '../services/apiErrorHandler';
import sentryService, { ErrorContext } from '../services/sentryService';
import { toast } from 'sonner';

interface ApiQueryOptions<T> extends Omit<UseQueryOptions<T, ApiError>, 'queryFn'> {
  queryFn: () => Promise<T>;
  endpoint?: string;
  method?: string;
  context?: ErrorContext;
  showErrorToast?: boolean;
}

interface ApiMutationOptions<T, V> extends Omit<UseMutationOptions<T, ApiError, V>, 'mutationFn'> {
  mutationFn: (variables: V) => Promise<T>;
  endpoint?: string;
  method?: string;
  context?: ErrorContext;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

/**
 * Enhanced useQuery hook with integrated error handling
 */
export function useApiQuery<T>({
  queryFn,
  endpoint,
  method = 'GET',
  context,
  showErrorToast = true,
  ...options
}: ApiQueryOptions<T>) {
  return useQuery<T, ApiError>({
    ...options,
    queryFn: async () => {
      return apiErrorHandler.handleApiCall(
        queryFn,
        endpoint,
        method,
        {
          ...context,
          action: 'query',
          page: window.location.pathname
        }
      );
    },
    onError: (error: ApiError) => {
      // Log query error
      sentryService.addBreadcrumb(
        `Query failed: ${options.queryKey?.join('/')}`,
        'query',
        'error',
        {
          endpoint,
          method,
          error: error.message,
          status: error.status
        }
      );

      // Show user-friendly error toast
      if (showErrorToast) {
        const message = apiErrorHandler.getUserFriendlyMessage(error);
        toast.error('Query Failed', {
          description: message,
          duration: 5000
        });
      }

      // Call original onError if provided
      options.onError?.(error);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (error.status && error.status >= 400 && error.status < 500) {
        return false;
      }
      
      // Retry up to 2 times for server errors and network issues
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
}

/**
 * Enhanced useMutation hook with integrated error handling
 */
export function useApiMutation<T, V = void>({
  mutationFn,
  endpoint,
  method = 'POST',
  context,
  showErrorToast = true,
  showSuccessToast = false,
  successMessage = 'Operation completed successfully',
  ...options
}: ApiMutationOptions<T, V>) {
  const queryClient = useQueryClient();

  return useMutation<T, ApiError, V>({
    ...options,
    mutationFn: async (variables: V) => {
      return apiErrorHandler.handleApiCall(
        () => mutationFn(variables),
        endpoint,
        method,
        {
          ...context,
          action: 'mutation',
          page: window.location.pathname,
          additionalData: {
            variables: typeof variables === 'object' ? variables : { value: variables }
          }
        }
      );
    },
    onSuccess: (data, variables, context) => {
      // Log successful mutation
      sentryService.addBreadcrumb(
        `Mutation succeeded: ${endpoint || 'unknown'}`,
        'mutation',
        'info',
        {
          endpoint,
          method
        }
      );

      // Show success toast if enabled
      if (showSuccessToast) {
        toast.success('Success', {
          description: successMessage,
          duration: 3000
        });
      }

      // Call original onSuccess if provided
      options.onSuccess?.(data, variables, context);
    },
    onError: (error: ApiError, variables, context) => {
      // Log mutation error
      sentryService.addBreadcrumb(
        `Mutation failed: ${endpoint || 'unknown'}`,
        'mutation',
        'error',
        {
          endpoint,
          method,
          error: error.message,
          status: error.status,
          variables: typeof variables === 'object' ? variables : { value: variables }
        }
      );

      // Show user-friendly error toast
      if (showErrorToast) {
        const message = apiErrorHandler.getUserFriendlyMessage(error);
        toast.error('Operation Failed', {
          description: message,
          duration: 5000,
          action: error.status && error.status >= 500 ? {
            label: 'Retry',
            onClick: () => {
              // Retry the mutation
              queryClient.invalidateQueries();
            }
          } : undefined
        });
      }

      // Call original onError if provided
      options.onError?.(error, variables, context);
    }
  });
}

/**
 * Hook for handling optimistic updates with error recovery
 */
export function useOptimisticMutation<T, V = void>({
  mutationFn,
  queryKey,
  optimisticUpdate,
  endpoint,
  method = 'POST',
  context,
  showErrorToast = true,
  showSuccessToast = false,
  successMessage = 'Operation completed successfully',
  ...options
}: ApiMutationOptions<T, V> & {
  queryKey: string[];
  optimisticUpdate: (oldData: any, variables: V) => any;
}) {
  const queryClient = useQueryClient();

  return useMutation<T, ApiError, V>({
    ...options,
    mutationFn: async (variables: V) => {
      return apiErrorHandler.handleApiCall(
        () => mutationFn(variables),
        endpoint,
        method,
        {
          ...context,
          action: 'optimistic_mutation',
          page: window.location.pathname
        }
      );
    },
    onMutate: async (variables: V) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old: any) => optimisticUpdate(old, variables));

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (error: ApiError, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }

      // Log optimistic mutation error
      sentryService.addBreadcrumb(
        `Optimistic mutation failed and rolled back: ${endpoint || 'unknown'}`,
        'mutation',
        'error',
        {
          endpoint,
          method,
          error: error.message,
          status: error.status,
          rolledBack: true
        }
      );

      // Show error toast
      if (showErrorToast) {
        const message = apiErrorHandler.getUserFriendlyMessage(error);
        toast.error('Operation Failed', {
          description: `${message} Changes have been reverted.`,
          duration: 5000
        });
      }

      // Call original onError if provided
      options.onError?.(error, variables, context);
    },
    onSuccess: (data, variables, context) => {
      // Log successful optimistic mutation
      sentryService.addBreadcrumb(
        `Optimistic mutation succeeded: ${endpoint || 'unknown'}`,
        'mutation',
        'info',
        {
          endpoint,
          method
        }
      );

      // Show success toast if enabled
      if (showSuccessToast) {
        toast.success('Success', {
          description: successMessage,
          duration: 3000
        });
      }

      // Call original onSuccess if provided
      options.onSuccess?.(data, variables, context);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey });
    }
  });
}

/**
 * Hook for handling file uploads with progress tracking
 */
export function useFileUploadMutation({
  uploadFn,
  endpoint,
  context,
  showErrorToast = true,
  showSuccessToast = true,
  successMessage = 'File uploaded successfully',
  onProgress,
  ...options
}: Omit<ApiMutationOptions<any, File>, 'mutationFn'> & {
  uploadFn: (file: File, onProgress?: (progress: number) => void) => Promise<any>;
  onProgress?: (progress: number) => void;
}) {
  return useMutation<any, ApiError, File>({
    ...options,
    mutationFn: async (file: File) => {
      return apiErrorHandler.handleApiCall(
        () => uploadFn(file, onProgress),
        endpoint,
        'POST',
        {
          ...context,
          action: 'file_upload',
          page: window.location.pathname,
          additionalData: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
          }
        }
      );
    },
    onSuccess: (data, file, context) => {
      // Log successful upload
      sentryService.addBreadcrumb(
        `File uploaded successfully: ${file.name}`,
        'upload',
        'info',
        {
          fileName: file.name,
          fileSize: file.size,
          endpoint
        }
      );

      // Show success toast
      if (showSuccessToast) {
        toast.success('Upload Complete', {
          description: successMessage,
          duration: 3000
        });
      }

      // Call original onSuccess if provided
      options.onSuccess?.(data, file, context);
    },
    onError: (error: ApiError, file, context) => {
      // Log upload error
      sentryService.addBreadcrumb(
        `File upload failed: ${file.name}`,
        'upload',
        'error',
        {
          fileName: file.name,
          fileSize: file.size,
          error: error.message,
          status: error.status,
          endpoint
        }
      );

      // Show error toast
      if (showErrorToast) {
        const message = apiErrorHandler.getUserFriendlyMessage(error);
        toast.error('Upload Failed', {
          description: `Failed to upload ${file.name}. ${message}`,
          duration: 5000
        });
      }

      // Call original onError if provided
      options.onError?.(error, file, context);
    }
  });
}