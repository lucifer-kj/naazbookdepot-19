import { ZodSchema, ZodError } from 'zod';
import { formValidationService, ServerValidationConfig } from '../services/formValidationService';
import sentryService from '../services/sentryService';
import { sanitizationService } from '../services/sanitizationService';
import { fileUploadSecurity, FileSecurityConfig } from '../services/fileUploadSecurity';
import { securityMiddleware } from './securityMiddleware';

export interface ValidationMiddlewareConfig {
  schema: ZodSchema;
  serverValidation?: ServerValidationConfig;
  skipSanitization?: boolean;
  customErrorHandler?: (errors: Record<string, string>) => any;
  securityLevel?: 'basic' | 'strict' | 'paranoid';
  enableCSRFValidation?: boolean;
  enableRateLimiting?: boolean;
  sanitizationOptions?: {
    level: 'basic' | 'strict' | 'html' | 'sql' | 'nosql';
    maxLength?: number;
    allowedPatterns?: RegExp[];
    blockedPatterns?: RegExp[];
  };
}

export interface ValidationResult {
  success: boolean;
  data?: any;
  errors?: Record<string, string>;
}

/**
 * Enhanced validation middleware for API requests with security features
 */
export async function validateRequest(
  requestData: any,
  config: ValidationMiddlewareConfig,
  requestContext?: {
    headers?: Record<string, string>;
    method?: string;
    url?: string;
  }
): Promise<ValidationResult> {
  const {
    schema,
    serverValidation,
    skipSanitization = false,
    customErrorHandler,
    securityLevel = 'basic',
    enableCSRFValidation = true,
    enableRateLimiting = true,
    sanitizationOptions
  } = config;

  try {
    // Security validation
    if (requestContext && securityLevel !== 'basic') {
      const securityResult = await securityMiddleware.validateRequest(requestContext);
      
      if (!securityResult.isValid) {
        return {
          success: false,
          errors: { security: securityResult.errors.join(', ') }
        };
      }
    }

    // Enhanced sanitization based on security level
    let sanitizedData = requestData;
    
    if (!skipSanitization) {
      sanitizedData = await enhancedSanitization(requestData, {
        level: sanitizationOptions?.level || 'basic',
        securityLevel,
        maxLength: sanitizationOptions?.maxLength,
        allowedPatterns: sanitizationOptions?.allowedPatterns,
        blockedPatterns: sanitizationOptions?.blockedPatterns
      });
    }

    // Schema validation
    const result = await formValidationService.validateFormData(
      sanitizedData,
      schema,
      serverValidation
    );

    if (!result.isValid) {
      const errors = customErrorHandler ? customErrorHandler(result.errors) : result.errors;
      return {
        success: false,
        errors
      };
    }

    // Additional security checks for paranoid level
    if (securityLevel === 'paranoid') {
      const securityCheck = await performParanoidSecurityCheck(result.sanitizedData);
      if (!securityCheck.passed) {
        return {
          success: false,
          errors: { security: securityCheck.errors.join(', ') }
        };
      }
    }

    return {
      success: true,
      data: result.sanitizedData
    };
  } catch (error) {
    sentryService.captureError(
      error instanceof Error ? error : new Error('Enhanced request validation failed'),
      {
        action: 'validate_request_enhanced',
        additionalData: { requestData, config, requestContext }
      }
    );

    return {
      success: false,
      errors: { general: 'Request validation failed' }
    };
  }
}

/**
 * Enhanced sanitization with multiple security levels
 */
async function enhancedSanitization(
  data: any,
  options: {
    level: 'basic' | 'strict' | 'html' | 'sql' | 'nosql';
    securityLevel: 'basic' | 'strict' | 'paranoid';
    maxLength?: number;
    allowedPatterns?: RegExp[];
    blockedPatterns?: RegExp[];
  }
): Promise<any> {
  if (typeof data === 'string') {
    // Apply appropriate sanitization based on level
    switch (options.level) {
      case 'strict':
        return sanitizationService.sanitizeInput(data, options.maxLength);
      case 'html':
        return sanitizationService.sanitizeHtml(data);
      case 'sql':
        return sanitizationService.sanitizeSQLInput(data);
      case 'nosql':
        return sanitizationService.sanitizeNoSQLInput(data);
      default:
        return sanitizationService.sanitizeInput(data, options.maxLength);
    }
  }

  if (Array.isArray(data)) {
    return Promise.all(data.map(item => enhancedSanitization(item, options)));
  }

  if (typeof data === 'object' && data !== null) {
    // Handle NoSQL injection for objects
    if (options.level === 'nosql' || options.securityLevel === 'paranoid') {
      data = sanitizationService.sanitizeNoSQLInput(data);
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      const sanitizedKey = sanitizationService.sanitizeInput(key);
      sanitized[sanitizedKey] = await enhancedSanitization(value, options);
    }
    return sanitized;
  }

  return data;
}

/**
 * Paranoid security checks for highly sensitive operations
 */
async function performParanoidSecurityCheck(
  data: any
): Promise<{ passed: boolean; errors: string[] }> {
  const errors: string[] = [];

  try {
    // Check for potential injection patterns
    const dataString = JSON.stringify(data);
    
    const suspiciousPatterns = [
      /\$\w+/g, // MongoDB operators
      /union\s+select/gi, // SQL injection
      /<script/gi, // XSS
      /javascript:/gi, // JavaScript protocol
      /data:/gi, // Data URLs
      /eval\s*\(/gi, // Code evaluation
      /function\s*\(/gi, // Function declarations
      /setTimeout|setInterval/gi, // Timer functions
      /document\.|window\./gi, // DOM access
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(dataString)) {
        errors.push(`Suspicious pattern detected: ${pattern.source}`);
      }
    }

    // Check for excessive nesting (potential DoS)
    const maxDepth = 10;
    const checkDepth = (obj: any, depth: number = 0): boolean => {
      if (depth > maxDepth) return false;
      
      if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
          return obj.every(item => checkDepth(item, depth + 1));
        } else {
          return Object.values(obj).every(value => checkDepth(value, depth + 1));
        }
      }
      
      return true;
    };

    if (!checkDepth(data)) {
      errors.push('Data structure too deeply nested');
    }

    // Check for excessively large strings
    const checkStringLengths = (obj: any): boolean => {
      if (typeof obj === 'string' && obj.length > 10000) {
        return false;
      }
      
      if (Array.isArray(obj)) {
        return obj.every(checkStringLengths);
      }
      
      if (typeof obj === 'object' && obj !== null) {
        return Object.values(obj).every(checkStringLengths);
      }
      
      return true;
    };

    if (!checkStringLengths(data)) {
      errors.push('Excessively large string detected');
    }

    return {
      passed: errors.length === 0,
      errors
    };
  } catch (error) {
    return {
      passed: false,
      errors: ['Paranoid security check failed']
    };
  }
}

/**
 * Higher-order function to create validation middleware for specific schemas
 */
export function createValidationMiddleware(config: ValidationMiddlewareConfig) {
  return async (requestData: any): Promise<ValidationResult> => {
    return validateRequest(requestData, config);
  };
}

/**
 * Validation middleware for file uploads
 */
export async function validateFileUpload(
  files: FileList | File[],
  options: {
    maxSize?: number;
    allowedTypes?: string[];
    maxFiles?: number;
  } = {}
): Promise<ValidationResult> {
  try {
    const result = await formValidationService.validateMultipleFiles(files, options);
    
    return {
      success: result.isValid,
      data: result.sanitizedData,
      errors: result.isValid ? undefined : result.errors
    };
  } catch (error) {
    sentryService.captureError(
      error instanceof Error ? error : new Error('File upload validation failed'),
      {
        action: 'validate_file_upload',
        additionalData: { fileCount: files.length, options }
      }
    );

    return {
      success: false,
      errors: { files: 'File validation failed' }
    };
  }
}

/**
 * Validation middleware for search queries
 */
export function validateSearchQuery(query: string): ValidationResult {
  try {
    const result = formValidationService.validateSearchQuery(query);
    
    return {
      success: result.isValid,
      data: result.sanitizedData,
      errors: result.isValid ? undefined : result.errors
    };
  } catch (error) {
    return {
      success: false,
      errors: { query: 'Search validation failed' }
    };
  }
}

// Pre-configured validation middleware for common use cases

export const authValidationMiddleware = {
  signUp: createValidationMiddleware({
    schema: null as any, // Will be loaded dynamically
    serverValidation: { checkUniqueEmail: true },
  }),
  
  signIn: createValidationMiddleware({
    schema: null as any, // Will be loaded dynamically
  }),
  
  forgotPassword: createValidationMiddleware({
    schema: null as any, // Will be loaded dynamically
  }),
  
  resetPassword: createValidationMiddleware({
    schema: null as any, // Will be loaded dynamically
  }),
};

export const productValidationMiddleware = {
  create: createValidationMiddleware({
    schema: null as any, // Will be loaded dynamically
    serverValidation: { validateInventory: true },
  }),
  
  update: createValidationMiddleware({
    schema: null as any, // Will be loaded dynamically
    serverValidation: { 
      checkExistingProduct: true,
      validateInventory: true 
    },
  }),
};

export const orderValidationMiddleware = {
  create: createValidationMiddleware({
    schema: null as any, // Will be loaded dynamically
    serverValidation: { 
      validateInventory: true,
      checkPromoCode: true 
    },
  }),
  
  update: createValidationMiddleware({
    schema: null as any, // Will be loaded dynamically
  }),
};

// Initialize schemas dynamically to avoid circular dependencies
let schemasLoaded = false;

export async function initializeValidationSchemas() {
  if (schemasLoaded) return;

  try {
    const schemas = await import('../validation/schemas');
    
    // Update auth middleware schemas
    authValidationMiddleware.signUp = createValidationMiddleware({
      schema: schemas.signUpSchema,
      serverValidation: { checkUniqueEmail: true },
    });
    
    authValidationMiddleware.signIn = createValidationMiddleware({
      schema: schemas.signInSchema,
    });
    
    authValidationMiddleware.forgotPassword = createValidationMiddleware({
      schema: schemas.forgotPasswordSchema,
    });
    
    authValidationMiddleware.resetPassword = createValidationMiddleware({
      schema: schemas.resetPasswordSchema,
    });
    
    // Update product middleware schemas
    productValidationMiddleware.create = createValidationMiddleware({
      schema: schemas.productSchema,
      serverValidation: { validateInventory: true },
    });
    
    productValidationMiddleware.update = createValidationMiddleware({
      schema: schemas.productSchema,
      serverValidation: { 
        checkExistingProduct: true,
        validateInventory: true 
      },
    });
    
    // Update order middleware schemas
    orderValidationMiddleware.create = createValidationMiddleware({
      schema: schemas.checkoutSchema,
      serverValidation: { 
        validateInventory: true,
        checkPromoCode: true 
      },
    });
    
    schemasLoaded = true;
  } catch (error) {
    sentryService.captureError(
      error instanceof Error ? error : new Error('Failed to initialize validation schemas'),
      { action: 'initialize_validation_schemas' }
    );
  }
}

// Auto-initialize schemas
initializeValidationSchemas();

export default {
  validateRequest,
  createValidationMiddleware,
  validateFileUpload,
  validateSearchQuery,
  authValidationMiddleware,
  productValidationMiddleware,
  orderValidationMiddleware,
  initializeValidationSchemas,
};