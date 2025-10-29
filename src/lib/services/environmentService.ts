/**
 * Environment Service
 * 
 * Centralized environment validation and configuration management
 */

import { env, validateRequiredEnvVars, EnvConfig } from '../config/env';
import { apiErrorHandler } from './apiErrorHandler';

export interface EnvironmentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequired: string[];
  missingOptional: string[];
}

export interface EnvironmentStatus {
  core: boolean;
  supabase: boolean;
  payment: boolean;
  monitoring: boolean;
  features: boolean;
}

class EnvironmentService {
  private validationResult: EnvironmentValidationResult | null = null;
  private isInitialized = false;

  /**
   * Initialize environment validation
   */
  initialize(): EnvironmentValidationResult {
    if (this.isInitialized && this.validationResult) {
      return this.validationResult;
    }

    this.validationResult = this.validateEnvironment();
    this.isInitialized = true;

    // Log validation results in development
    if (env.VITE_NODE_ENV === 'development') {
      this.logValidationResults(this.validationResult);
    }

    return this.validationResult;
  }

  /**
   * Validate all environment variables
   */
  private validateEnvironment(): EnvironmentValidationResult {
    const result: EnvironmentValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      missingRequired: [],
      missingOptional: []
    };

    // Core required variables
    const coreRequired = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_API_BASE_URL'
    ];

    // Optional but recommended variables
    const optionalRecommended = [
      'VITE_SENTRY_DSN',
      'VITE_PAYPAL_CLIENT_ID',
      'VITE_PAYU_MERCHANT_KEY',
      'VITE_IMAGE_CDN_URL'
    ];

    // Validate core required variables
    try {
      validateRequiredEnvVars(coreRequired as (keyof EnvConfig)[]);
    } catch (error) {
      result.isValid = false;
      result.errors.push(error.message);
      
      // Extract missing variables from error message
      const missingVars = coreRequired.filter(varName => !env[varName as keyof EnvConfig]);
      result.missingRequired.push(...missingVars);
    }

    // Check optional variables
    optionalRecommended.forEach(varName => {
      if (!env[varName as keyof EnvConfig]) {
        result.missingOptional.push(varName);
      }
    });

    // Validate Supabase URL format
    if (env.VITE_SUPABASE_URL) {
      if (!env.VITE_SUPABASE_URL.includes('supabase.co')) {
        result.warnings.push('Supabase URL format may be incorrect');
      }
    }

    // Validate API URL format
    if (env.VITE_API_BASE_URL) {
      try {
        new URL(env.VITE_API_BASE_URL);
      } catch {
        result.errors.push('VITE_API_BASE_URL is not a valid URL');
        result.isValid = false;
      }
    }

    // Validate payment configuration
    const hasPayPal = env.VITE_PAYPAL_CLIENT_ID && env.VITE_PAYPAL_CLIENT_SECRET;
    const hasPayU = env.VITE_PAYU_MERCHANT_KEY && env.VITE_PAYU_MERCHANT_SALT;
    
    if (!hasPayPal && !hasPayU) {
      result.warnings.push('No payment gateway configured. Payment functionality will be limited.');
    }

    // Validate monitoring configuration
    if (!env.VITE_SENTRY_DSN && env.VITE_NODE_ENV === 'production') {
      result.warnings.push('Error monitoring not configured for production environment');
    }

    return result;
  }

  /**
   * Get environment status by category
   */
  getEnvironmentStatus(): EnvironmentStatus {
    const validation = this.getValidationResult();
    
    return {
      core: !validation.missingRequired.some(v => 
        ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_API_BASE_URL'].includes(v)
      ),
      supabase: !!(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY),
      payment: !!(
        (env.VITE_PAYPAL_CLIENT_ID && env.VITE_PAYPAL_CLIENT_SECRET) ||
        (env.VITE_PAYU_MERCHANT_KEY && env.VITE_PAYU_MERCHANT_SALT)
      ),
      monitoring: !!(env.VITE_SENTRY_DSN && env.VITE_ENABLE_ERROR_REPORTING),
      features: validation.errors.length === 0
    };
  }

  /**
   * Get validation result
   */
  getValidationResult(): EnvironmentValidationResult {
    if (!this.validationResult) {
      return this.initialize();
    }
    return this.validationResult;
  }

  /**
   * Check if environment is production ready
   */
  isProductionReady(): boolean {
    const validation = this.getValidationResult();
    const status = this.getEnvironmentStatus();
    
    return validation.isValid && 
           status.core && 
           status.supabase && 
           (env.VITE_NODE_ENV !== 'production' || status.monitoring);
  }

  /**
   * Get missing environment variables for setup
   */
  getMissingVariables(): { required: string[]; optional: string[] } {
    const validation = this.getValidationResult();
    return {
      required: validation.missingRequired,
      optional: validation.missingOptional
    };
  }

  /**
   * Log validation results (development only)
   */
  private logValidationResults(result: EnvironmentValidationResult): void {
    if (env.VITE_NODE_ENV !== 'development') return;

    console.group('🔧 Environment Configuration Status');
    
    if (result.isValid) {
      console.log('✅ Core environment validation passed');
    } else {
      console.error('❌ Environment validation failed');
      result.errors.forEach(error => console.error(`  • ${error}`));
    }

    if (result.warnings.length > 0) {
      import('../utils/consoleMigration').then(({ logWarning }) => {
        logWarning('Environment warnings detected', { warnings: result.warnings });
        result.warnings.forEach(warning => {
          logWarning(`Environment warning: ${warning}`);
        });
      });
    }

    if (result.missingRequired.length > 0) {
      console.error('🚨 Missing required variables:');
      result.missingRequired.forEach(variable => console.error(`  • ${variable}`));
    }

    if (result.missingOptional.length > 0) {
      console.info('💡 Missing optional variables (recommended):');
      result.missingOptional.forEach(variable => console.info(`  • ${variable}`));
    }

    const status = this.getEnvironmentStatus();
    console.log('📊 Environment Status:', {
      core: status.core ? '✅' : '❌',
      supabase: status.supabase ? '✅' : '❌',
      payment: status.payment ? '✅' : '⚠️',
      monitoring: status.monitoring ? '✅' : '⚠️',
      features: status.features ? '✅' : '❌'
    });

    console.groupEnd();
  }

  /**
   * Handle environment-related errors with proper logging
   */
  handleEnvironmentError(error: Error, context: string): void {
    apiErrorHandler.logError(error, {
      component: 'environment',
      action: context,
      additionalData: {
        nodeEnv: env.VITE_NODE_ENV,
        validationStatus: this.getValidationResult()
      }
    });
  }

  /**
   * Get setup instructions for missing variables
   */
  getSetupInstructions(): string[] {
    const missing = this.getMissingVariables();
    const instructions: string[] = [];

    if (missing.required.length > 0) {
      instructions.push('Required environment variables are missing:');
      instructions.push('1. Copy .env.example to .env (if not already done)');
      instructions.push('2. Update the following variables in your .env file:');
      missing.required.forEach(variable => {
        instructions.push(`   - ${variable}`);
      });
      instructions.push('3. Restart the development server');
    }

    if (missing.optional.length > 0) {
      instructions.push('');
      instructions.push('Optional but recommended variables:');
      missing.optional.forEach(variable => {
        instructions.push(`   - ${variable}`);
      });
    }

    return instructions;
  }
}

// Export singleton instance
export const environmentService = new EnvironmentService();

// Export convenience functions
export const validateEnvironment = () => environmentService.initialize();
export const getEnvironmentStatus = () => environmentService.getEnvironmentStatus();
export const isProductionReady = () => environmentService.isProductionReady();
export const getMissingVariables = () => environmentService.getMissingVariables();
export const getSetupInstructions = () => environmentService.getSetupInstructions();

export default environmentService;
