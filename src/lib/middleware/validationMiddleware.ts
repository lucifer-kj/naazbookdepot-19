import { ZodSchema, ZodError } from 'zod';
import { formValidationService, ServerValidationConfig } from '../services/formValidationService';
import sentryService from '../services/sentryService';

export interface ValidationMiddlewareConfig {
  schema: ZodSchema;
  serverValidation?: ServerValidationConfig;
  skipSanitization?: boolean;
  customErrorHandler?: (errors: Record<string, string>) => any;
}

export interface ValidationResult {
  success: boolean;
  data?: any;
  errors?: Record<string, string>;
}

/**
 * Validation middleware for API requests
 */
export async function validateRequest(
  requestData: any,
  config: ValidationMiddlewareConfig
): Promise<ValidationResult> {
  const {
    schema,
    serverValidation,
    skipSanitization = false,
    customErrorHandler
  } = config;

  try {
    const result = await formValidationService.validateFormData(
      requestData,
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

    return {
      success: true,
      data: result.sanitizedData
    };
  } catch (error) {
    sentryService.captureError(
      error instanceof Error ? error : new Error('Request validation failed'),
      {
        action: 'validate_request',
        additionalData: { requestData, config }
      }
    );

    return {
      success: false,
      errors: { general: 'Request validation failed' }
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