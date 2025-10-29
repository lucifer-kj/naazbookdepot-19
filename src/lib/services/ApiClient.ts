import { apiErrorHandler, ApiError } from './apiErrorHandler';
import { ErrorContext } from './sentryService';
import { supabase } from '../supabase';
import { Database } from '../../types/supabase';
import { ApiResponseHandler, ApiResult } from './ApiResponseHandler';
import { securityMiddleware } from '../middleware/securityMiddleware';
import { csrfService } from './csrfService';
import { sessionService } from './sessionService';

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  enableLogging?: boolean;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  success: boolean;
  status?: number;
}

/**
 * Centralized API client with standardized error handling
 * Provides a unified interface for all API operations
 */
export class ApiClient {
  private config: ApiClientConfig;
  private fetchWrapper: ReturnType<typeof apiErrorHandler.createFetchWrapper>;

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      timeout: 30000,
      retries: 3,
      enableLogging: true,
      ...config
    };

    this.fetchWrapper = apiErrorHandler.createFetchWrapper();
    
    // Initialize security middleware
    this.initializeSecurity();
  }

  /**
   * Initialize security middleware and interceptors
   */
  private initializeSecurity(): void {
    // Set up request interceptor for security
    const originalFetchWrapper = this.fetchWrapper;
    
    this.fetchWrapper = async <T>(
      url: string,
      options: RequestInit = {},
      context?: ErrorContext
    ): Promise<T> => {
      // Apply security middleware to request
      const securityResult = await securityMiddleware.validateRequest({
        headers: options.headers as Record<string, string>,
        method: options.method,
        url,
        body: options.body
      });

      if (!securityResult.isValid) {
        throw new Error(`Security validation failed: ${securityResult.errors.join(', ')}`);
      }

      // Add security headers
      const enhancedOptions: RequestInit = {
        ...options,
        headers: {
          ...options.headers,
          ...securityResult.headers
        }
      };

      // Add CSRF token for state-changing requests
      if (this.isStateChangingRequest(options.method)) {
        const csrfHeaders = csrfService.getTokenHeader();
        enhancedOptions.headers = {
          ...enhancedOptions.headers,
          ...csrfHeaders
        };
      }

      return originalFetchWrapper<T>(url, enhancedOptions, context);
    };
  }

  /**
   * Check if request method is state-changing
   */
  private isStateChangingRequest(method?: string): boolean {
    if (!method) return false;
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
  }

  /**
   * Generic API call wrapper that standardizes all responses
   */
  async call<T>(
    operation: () => Promise<T>,
    endpoint: string,
    method: string = 'GET',
    context?: ErrorContext
  ): Promise<ApiResponse<T>> {
    try {
      const data = await apiErrorHandler.handleApiCall(
        operation,
        endpoint,
        method,
        context
      );

      return {
        data,
        success: true,
        status: 200
      };
    } catch (error) {
      const apiError = error as ApiError;
      
      return {
        error: apiError,
        success: false,
        status: apiError.status
      };
    }
  }

  /**
   * Supabase query wrapper with standardized error handling
   */
  async supabaseQuery<T>(
    queryFn: () => Promise<{ data: T | null; error: unknown }>,
    operation: string,
    context?: ErrorContext
  ): Promise<ApiResponse<T>> {
    return this.call(
      async () => {
        const result = await queryFn();
        const { data, error } = result;
        
        if (error) {
          apiErrorHandler.handleSupabaseError(error, operation, context);
        }
        
        return data;
      },
      `supabase/${operation}`,
      'POST',
      context
    );
  }

  /**
   * HTTP GET request
   */
  async get<T>(
    url: string,
    options: RequestInit = {},
    context?: ErrorContext
  ): Promise<ApiResponse<T>> {
    return this.call(
      () => this.fetchWrapper<T>(url, { ...options, method: 'GET' }, context),
      url,
      'GET',
      context
    );
  }

  /**
   * HTTP POST request
   */
  async post<T>(
    url: string,
    data?: unknown,
    options: RequestInit = {},
    context?: ErrorContext
  ): Promise<ApiResponse<T>> {
    const requestOptions: RequestInit = {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: data ? JSON.stringify(data) : undefined
    };

    return this.call(
      () => this.fetchWrapper<T>(url, requestOptions, context),
      url,
      'POST',
      context
    );
  }

  /**
   * HTTP PUT request
   */
  async put<T>(
    url: string,
    data?: unknown,
    options: RequestInit = {},
    context?: ErrorContext
  ): Promise<ApiResponse<T>> {
    const requestOptions: RequestInit = {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: data ? JSON.stringify(data) : undefined
    };

    return this.call(
      () => this.fetchWrapper<T>(url, requestOptions, context),
      url,
      'PUT',
      context
    );
  }

  /**
   * HTTP DELETE request
   */
  async delete<T>(
    url: string,
    options: RequestInit = {},
    context?: ErrorContext
  ): Promise<ApiResponse<T>> {
    return this.call(
      () => this.fetchWrapper<T>(url, { ...options, method: 'DELETE' }, context),
      url,
      'DELETE',
      context
    );
  }

  /**
   * Products API methods
   */
  products = {
    getAll: async (context?: ErrorContext): Promise<ApiResult<Database['public']['Tables']['products']['Row'][]>> => {
      return ApiResponseHandler.handleArrayResponse(
        supabase.from('products').select('*').eq('status', 'published'),
        {
          component: 'ApiClient',
          action: 'products/getAll',
          ...context
        }
      );
    },

    getById: async (id: string, context?: ErrorContext): Promise<ApiResult<Database['public']['Tables']['products']['Row']>> => {
      // Validate required fields
      if (!id || id.trim() === '') {
        return {
          error: 'Product ID is required',
          success: false,
          details: { providedId: id }
        };
      }

      return ApiResponseHandler.handleSingleResponse(
        supabase.from('products').select('*').eq('id', id).single(),
        {
          component: 'ApiClient',
          action: 'products/getById',
          additionalData: { productId: id },
          ...context
        }
      );
    },

    create: async (product: Database['public']['Tables']['products']['Insert'], context?: ErrorContext): Promise<ApiResult<Database['public']['Tables']['products']['Row']>> => {
      // Validate required fields
      const validation = ApiResponseHandler.validateRequiredFields(
        product,
        ['title', 'price'],
        'products/create'
      );

      if (!validation.isValid) {
        return {
          error: `Missing required fields: ${validation.missingFields.join(', ')}`,
          success: false,
          details: { missingFields: validation.missingFields }
        };
      }

      return ApiResponseHandler.handleSingleResponse(
        supabase.from('products').insert(product).select().single(),
        {
          component: 'ApiClient',
          action: 'products/create',
          additionalData: { productData: product },
          ...context
        }
      );
    },

    update: async (id: string, updates: Database['public']['Tables']['products']['Update'], context?: ErrorContext): Promise<ApiResult<Database['public']['Tables']['products']['Row']>> => {
      // Validate required fields
      if (!id || id.trim() === '') {
        return {
          error: 'Product ID is required',
          success: false,
          details: { providedId: id }
        };
      }

      return ApiResponseHandler.handleSingleResponse(
        supabase.from('products').update(updates).eq('id', id).select().single(),
        {
          component: 'ApiClient',
          action: 'products/update',
          additionalData: { productId: id, updates },
          ...context
        }
      );
    },

    delete: async (id: string, context?: ErrorContext): Promise<ApiResult<void>> => {
      // Validate required fields
      if (!id || id.trim() === '') {
        return {
          error: 'Product ID is required',
          success: false,
          details: { providedId: id }
        };
      }

      const result = await ApiResponseHandler.handleSupabaseResponse(
        supabase.from('products').delete().eq('id', id),
        {
          component: 'ApiClient',
          action: 'products/delete',
          additionalData: { productId: id },
          ...context
        }
      );

      if (result.success) {
        return { data: undefined, success: true } as ApiResult<void>;
      }
      return result as ApiResult<void>;
    }
  };

  /**
   * Orders API methods
   */
  orders = {
    getAll: (context?: ErrorContext) =>
      this.supabaseQuery(
        async () => await supabase.from('orders').select('*, order_items(*, products(*))').order('created_at', { ascending: false }),
        'orders/getAll',
        context
      ),

    getById: (id: string, context?: ErrorContext) =>
      this.supabaseQuery(
        async () => await supabase.from('orders').select('*, order_items(*, products(*))').eq('id', id).single(),
        'orders/getById',
        context
      ),

    create: (order: Database['public']['Tables']['orders']['Insert'], context?: ErrorContext) =>
      this.supabaseQuery(
        async () => await supabase.from('orders').insert(order).select().single(),
        'orders/create',
        context
      ),

    updateStatus: (id: string, status: string, context?: ErrorContext) =>
      this.supabaseQuery(
        async () => await supabase.from('orders').update({ status }).eq('id', id).select().single(),
        'orders/updateStatus',
        context
      )
  };

  /**
   * Authentication methods
   */
  auth = {
    signUp: (email: string, password: string, fullName: string, context?: ErrorContext) =>
      this.call(
        async () => {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName }
            }
          });

          if (error) throw error;
          return data;
        },
        'auth/signup',
        'POST',
        context
      ),

    signIn: (email: string, password: string, context?: ErrorContext) =>
      this.call(
        async () => {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) throw error;
          return data;
        },
        'auth/signin',
        'POST',
        context
      ),

    signOut: (context?: ErrorContext) =>
      this.call(
        async () => {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
        },
        'auth/signout',
        'POST',
        context
      ),

    getCurrentUser: (context?: ErrorContext) =>
      this.call(
        async () => {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;
          return session?.user;
        },
        'auth/session',
        'GET',
        context
      )
  };
}

// Create singleton instance
export const apiClient = new ApiClient();

export default apiClient;
