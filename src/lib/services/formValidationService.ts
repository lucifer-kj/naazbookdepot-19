import { ZodSchema, ZodError } from 'zod';
import { sanitizationService } from './sanitizationService';
import sentryService from './sentryService';
import { supabase } from '../supabase';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData?: any;
}

export interface ServerValidationConfig {
  checkUniqueEmail?: boolean;
  checkUniqueUsername?: boolean;
  checkExistingProduct?: boolean;
  validateInventory?: boolean;
  checkPromoCode?: boolean;
}

class FormValidationService {
  /**
   * Validates form data against a Zod schema with sanitization
   */
  async validateFormData<T>(
    data: T,
    schema: ZodSchema<T>,
    serverConfig?: ServerValidationConfig
  ): Promise<ValidationResult> {
    try {
      // First sanitize the data
      const sanitizedData = sanitizationService.sanitizeFormData(data as Record<string, any>);
      
      // Validate against schema
      const validatedData = await schema.parseAsync(sanitizedData);
      
      // Perform server-side validations if configured
      if (serverConfig) {
        const serverErrors = await this.performServerValidations(validatedData, serverConfig);
        if (Object.keys(serverErrors).length > 0) {
          return {
            isValid: false,
            errors: serverErrors,
            sanitizedData: validatedData
          };
        }
      }
      
      return {
        isValid: true,
        errors: {},
        sanitizedData: validatedData
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const fieldName = err.path.join('.');
          errors[fieldName] = err.message;
        });
        
        return {
          isValid: false,
          errors,
          sanitizedData: data
        };
      }
      
      sentryService.captureError(
        error instanceof Error ? error : new Error('Form validation failed'),
        {
          action: 'validate_form_data',
          additionalData: { formData: data }
        }
      );
      
      return {
        isValid: false,
        errors: { general: 'Validation failed. Please try again.' },
        sanitizedData: data
      };
    }
  }

  /**
   * Performs server-side validations
   */
  private async performServerValidations(
    data: any,
    config: ServerValidationConfig
  ): Promise<Record<string, string>> {
    const errors: Record<string, string> = {};

    try {
      // Check unique email
      if (config.checkUniqueEmail && data.email) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', data.email)
          .single();
        
        if (existingUser) {
          errors.email = 'This email address is already registered';
        }
      }

      // Check unique username
      if (config.checkUniqueUsername && data.username) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', data.username)
          .single();
        
        if (existingUser) {
          errors.username = 'This username is already taken';
        }
      }

      // Check existing product (for updates)
      if (config.checkExistingProduct && data.id) {
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('id', data.id)
          .single();
        
        if (!existingProduct) {
          errors.general = 'Product not found';
        }
      }

      // Validate inventory
      if (config.validateInventory && data.stockQuantity !== undefined) {
        if (data.stockQuantity < 0) {
          errors.stockQuantity = 'Stock quantity cannot be negative';
        }
        
        if (data.lowStockThreshold && data.stockQuantity < data.lowStockThreshold) {
          errors.stockQuantity = 'Stock quantity is below the low stock threshold';
        }
      }

      // Check promo code validity
      if (config.checkPromoCode && data.promoCode) {
        const { data: promoCode } = await supabase
          .from('promo_codes')
          .select('*')
          .eq('code', data.promoCode)
          .eq('is_active', true)
          .single();
        
        if (!promoCode) {
          errors.promoCode = 'Invalid promo code';
        } else {
          const now = new Date();
          const validFrom = new Date(promoCode.valid_from);
          const validUntil = new Date(promoCode.valid_until);
          
          if (now < validFrom || now > validUntil) {
            errors.promoCode = 'Promo code has expired or is not yet valid';
          }
          
          if (promoCode.max_uses && promoCode.used_count >= promoCode.max_uses) {
            errors.promoCode = 'Promo code usage limit exceeded';
          }
          
          if (promoCode.min_order_amount && data.orderAmount < promoCode.min_order_amount) {
            errors.promoCode = `Minimum order amount of ₹${promoCode.min_order_amount} required for this promo code`;
          }
        }
      }
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('Server validation failed'),
        {
          action: 'server_validation',
          additionalData: { data, config }
        }
      );
      
      errors.general = 'Server validation failed. Please try again.';
    }

    return errors;
  }

  /**
   * Validates file uploads
   */
  async validateFileUpload(
    file: File,
    options: {
      maxSize?: number; // in bytes
      allowedTypes?: string[];
      maxFiles?: number;
    } = {}
  ): Promise<ValidationResult> {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
      maxFiles = 10
    } = options;

    const errors: Record<string, string> = {};

    try {
      // Check file size
      if (file.size > maxSize) {
        errors.file = `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`;
      }

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        errors.file = `File type must be one of: ${allowedTypes.join(', ')}`;
      }

      // Sanitize file name
      const sanitizedName = sanitizationService.sanitizeFileName(file.name);
      if (!sanitizedName) {
        errors.file = 'Invalid file name';
      }

      // Check for malicious content (basic check)
      if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
        errors.file = 'Invalid file name characters';
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        sanitizedData: {
          ...file,
          name: sanitizedName
        }
      };
    } catch (error) {
      sentryService.captureError(
        error instanceof Error ? error : new Error('File validation failed'),
        {
          action: 'validate_file_upload',
          additionalData: { fileName: file.name, fileSize: file.size, fileType: file.type }
        }
      );

      return {
        isValid: false,
        errors: { file: 'File validation failed' }
      };
    }
  }

  /**
   * Validates multiple files
   */
  async validateMultipleFiles(
    files: FileList | File[],
    options: {
      maxSize?: number;
      allowedTypes?: string[];
      maxFiles?: number;
    } = {}
  ): Promise<ValidationResult> {
    const { maxFiles = 10 } = options;
    const errors: Record<string, string> = {};
    const fileArray = Array.from(files);

    if (fileArray.length > maxFiles) {
      errors.files = `Maximum ${maxFiles} files allowed`;
      return { isValid: false, errors };
    }

    const validationPromises = fileArray.map((file, index) =>
      this.validateFileUpload(file, options).then(result => ({
        index,
        result
      }))
    );

    const results = await Promise.all(validationPromises);
    
    results.forEach(({ index, result }) => {
      if (!result.isValid) {
        Object.entries(result.errors).forEach(([key, message]) => {
          errors[`file_${index}_${key}`] = message;
        });
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      sanitizedData: results.map(r => r.result.sanitizedData).filter(Boolean)
    };
  }

  /**
   * Validates API request data
   */
  async validateApiRequest<T>(
    data: T,
    schema: ZodSchema<T>,
    serverConfig?: ServerValidationConfig
  ): Promise<ValidationResult> {
    // Add rate limiting check
    const rateLimitResult = await this.checkRateLimit(data);
    if (!rateLimitResult.isValid) {
      return rateLimitResult;
    }

    return this.validateFormData(data, schema, serverConfig);
  }

  /**
   * Basic rate limiting check
   */
  private async checkRateLimit(data: any): Promise<ValidationResult> {
    // This is a basic implementation - in production, use Redis or similar
    const identifier = data.email || data.userId || 'anonymous';
    const key = `rate_limit_${identifier}`;
    
    try {
      // Check if we have rate limiting data in localStorage (client-side)
      if (typeof window !== 'undefined') {
        const lastRequest = localStorage.getItem(key);
        if (lastRequest) {
          const timeDiff = Date.now() - parseInt(lastRequest);
          if (timeDiff < 1000) { // 1 second rate limit
            return {
              isValid: false,
              errors: { general: 'Too many requests. Please wait a moment.' }
            };
          }
        }
        localStorage.setItem(key, Date.now().toString());
      }

      return { isValid: true, errors: {} };
    } catch (error) {
      // If rate limiting fails, allow the request
      return { isValid: true, errors: {} };
    }
  }

  /**
   * Validates search queries
   */
  validateSearchQuery(query: string): ValidationResult {
    const errors: Record<string, string> = {};

    try {
      const sanitizedQuery = sanitizationService.sanitizeSearchQuery(query);
      
      if (!sanitizedQuery || sanitizedQuery.length < 2) {
        errors.query = 'Search query must be at least 2 characters long';
      }

      if (sanitizedQuery.length > 100) {
        errors.query = 'Search query is too long';
      }

      // Check for potential SQL injection patterns
      const dangerousPatterns = [
        /union\s+select/i,
        /drop\s+table/i,
        /delete\s+from/i,
        /insert\s+into/i,
        /update\s+set/i,
        /--/,
        /\/\*/,
        /\*\//
      ];

      if (dangerousPatterns.some(pattern => pattern.test(sanitizedQuery))) {
        errors.query = 'Invalid search query';
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        sanitizedData: sanitizedQuery
      };
    } catch (error) {
      return {
        isValid: false,
        errors: { query: 'Search validation failed' }
      };
    }
  }
}

// Create singleton instance
export const formValidationService = new FormValidationService();

export default formValidationService;