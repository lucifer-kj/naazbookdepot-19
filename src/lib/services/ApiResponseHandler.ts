import { PostgrestError } from '@supabase/supabase-js';
import { apiErrorHandler } from './apiErrorHandler';
import { ErrorContext } from './sentryService';

export interface ApiResponse<T> {
  data: T | null;
  error: PostgrestError | null;
  success: boolean;
}

export interface StandardizedResponse<T> {
  data: T;
  success: true;
}

export interface StandardizedError {
  error: string;
  success: false;
  details?: any;
}

export type ApiResult<T> = StandardizedResponse<T> | StandardizedError;

/**
 * Standardized API response handler that ensures consistent response parsing
 * and proper null/undefined checks across all API calls
 */
export class ApiResponseHandler {
  /**
   * Handles Supabase query responses with standardized error handling and null checks
   */
  static async handleSupabaseResponse<T>(
    queryBuilder: any,
    context: ErrorContext
  ): Promise<ApiResult<T>> {
    try {
      const { data, error } = await queryBuilder;

      if (error) {
        return {
          error: error.message || 'Database error occurred',
          success: false,
          details: { error, context: context.action }
        };
      }

      if (data === null || data === undefined) {
        return {
          error: 'No data returned from query',
          success: false,
          details: { context: context.action }
        };
      }

      return {
        data,
        success: true
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false,
        details: { error: err, context: context.action }
      };
    }
  }

  /**
   * Handles array responses with proper validation
   */
  static async handleArrayResponse<T>(
    queryBuilder: any,
    context: ErrorContext
  ): Promise<ApiResult<T[]>> {
    try {
      const { data, error } = await queryBuilder;

      if (error) {
        return {
          error: error.message || 'Database error occurred',
          success: false,
          details: { error, context: context.action }
        };
      }

      // For arrays, null/undefined should return empty array
      const safeData = data ?? [];

      return {
        data: safeData,
        success: true
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false,
        details: { error: err, context: context.action }
      };
    }
  }

  /**
   * Handles single record responses with proper validation
   */
  static async handleSingleResponse<T>(
    queryBuilder: any,
    context: ErrorContext,
    allowNull: boolean = false
  ): Promise<ApiResult<T | null>> {
    try {
      const { data, error } = await queryBuilder;

      if (error) {
        return {
          error: error.message || 'Database error occurred',
          success: false,
          details: { error, context: context.action }
        };
      }

      if (!allowNull && (data === null || data === undefined)) {
        return {
          error: 'Record not found',
          success: false,
          details: { context: context.action }
        };
      }

      return {
        data,
        success: true
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false,
        details: { error: err, context: context.action }
      };
    }
  }

  /**
   * Safely accesses nested object properties with fallback values
   */
  static safeGet<T>(obj: any, path: string, defaultValue: T): T {
    try {
      const keys = path.split('.');
      let current = obj;

      for (const key of keys) {
        if (current === null || current === undefined || !(key in current)) {
          return defaultValue;
        }
        current = current[key];
      }

      return current !== null && current !== undefined ? current : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Validates required fields in API response data
   */
  static validateRequiredFields<T extends Record<string, any>>(
    data: T,
    requiredFields: (keyof T)[],
    context: string
  ): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      const value = data[field];
      if (value === null || value === undefined || value === '') {
        missingFields.push(String(field));
      }
    }

    if (missingFields.length > 0) {
      console.warn(`Missing required fields in ${context}:`, missingFields);
    }

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  /**
   * Transforms API response data with type safety
   */
  static transformResponse<TInput, TOutput>(
    data: TInput,
    transformer: (input: TInput) => TOutput,
    context: string
  ): ApiResult<TOutput> {
    try {
      const transformed = transformer(data);
      return {
        data: transformed,
        success: true
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Transformation error occurred',
        success: false,
        details: { error: err, context: `transform_${context}`, originalData: data }
      };
    }
  }

  /**
   * Handles paginated responses with proper validation
   */
  static async handlePaginatedResponse<T>(
    queryBuilder: any,
    context: ErrorContext
  ): Promise<ApiResult<{ items: T[]; total: number; hasMore: boolean }>> {
    try {
      const { data, error, count } = await queryBuilder;

      if (error) {
        return {
          error: error.message || 'Database error occurred',
          success: false,
          details: { error, context: context.action }
        };
      }

      const safeData = data ?? [];
      const safeCount = count ?? 0;

      return {
        data: {
          items: safeData,
          total: safeCount,
          hasMore: safeData.length < safeCount
        },
        success: true
      };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Unknown error occurred',
        success: false,
        details: { error: err, context: context.action }
      };
    }
  }
}

/**
 * Utility function to check if an API result is successful
 */
export function isSuccessResult<T>(result: ApiResult<T>): result is StandardizedResponse<T> {
  return result.success === true;
}

/**
 * Utility function to check if an API result is an error
 */
export function isErrorResult<T>(result: ApiResult<T>): result is StandardizedError {
  return result.success === false;
}

/**
 * Utility function to extract data from successful API result or throw error
 */
export function extractData<T>(result: ApiResult<T>): T {
  if (isSuccessResult(result)) {
    return result.data;
  }
  throw new Error(result.error);
}

/**
 * Utility function to safely extract data with fallback
 */
export function extractDataSafe<T>(result: ApiResult<T>, fallback: T): T {
  if (isSuccessResult(result)) {
    return result.data;
  }
  return fallback;
}