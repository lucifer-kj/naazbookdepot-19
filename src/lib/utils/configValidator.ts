/**
 * Configuration Validator
 * 
 * Validates application configuration at build time and runtime
 */

import { env, EnvConfig } from '../config/env';
import { environmentService } from '../services/environmentService';

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

class ConfigValidator {
  /**
   * Validate Supabase configuration
   */
  validateSupabaseConfig(): ConfigValidationResult {
    const result: ConfigValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };

    // Check required Supabase variables
    if (!env.VITE_SUPABASE_URL) {
      result.errors.push('VITE_SUPABASE_URL is required');
      result.isValid = false;
    } else {
      // Validate URL format
      try {
        const url = new URL(env.VITE_SUPABASE_URL);
        if (!url.hostname.includes('supabase.co')) {
          result.warnings.push('Supabase URL format may be incorrect');
        }
      } catch {
        result.errors.push('VITE_SUPABASE_URL is not a valid URL');
        result.isValid = false;
      }
    }

    if (!env.VITE_SUPABASE_ANON_KEY) {
      result.errors.push('VITE_SUPABASE_ANON_KEY is required');
      result.isValid = false;
    } else if (env.VITE_SUPABASE_ANON_KEY.length < 100) {
      result.warnings.push('VITE_SUPABASE_ANON_KEY appears to be too short');
    }

    // Check service role key for admin functions
    if (!env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
      result.recommendations.push('Consider adding VITE_SUPABASE_SERVICE_ROLE_KEY for admin functions');
    }

    return result;
  }

  /**
   * Validate payment configuration
   */
  validatePaymentConfig(): ConfigValidationResult {
    const result: ConfigValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };

    const hasPayPal = env.VITE_PAYPAL_CLIENT_ID && env.VITE_PAYPAL_CLIENT_SECRET;
    const hasPayU = env.VITE_PAYU_MERCHANT_KEY && env.VITE_PAYU_MERCHANT_SALT;

    if (!hasPayPal && !hasPayU) {
      result.warnings.push('No payment gateway configured');
      result.recommendations.push('Configure PayPal or PayU for payment processing');
    }

    // Validate PayPal configuration
    if (env.VITE_PAYPAL_CLIENT_ID && !env.VITE_PAYPAL_CLIENT_SECRET) {
      result.errors.push('VITE_PAYPAL_CLIENT_SECRET is required when VITE_PAYPAL_CLIENT_ID is set');
      result.isValid = false;
    }

    // Validate PayU configuration
    if (env.VITE_PAYU_MERCHANT_KEY && !env.VITE_PAYU_MERCHANT_SALT) {
      result.errors.push('VITE_PAYU_MERCHANT_SALT is required when VITE_PAYU_MERCHANT_KEY is set');
      result.isValid = false;
    }

    // Check environment consistency
    if (env.VITE_NODE_ENV === 'production') {
      if (env.VITE_PAYPAL_ENVIRONMENT === 'sandbox') {
        result.warnings.push('PayPal is configured for sandbox in production environment');
      }
      if (env.VITE_PAYU_ENVIRONMENT === 'test') {
        result.warnings.push('PayU is configured for test in production environment');
      }
    }

    return result;
  }

  /**
   * Validate monitoring configuration
   */
  validateMonitoringConfig(): ConfigValidationResult {
    const result: ConfigValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };

    // Check Sentry configuration
    if (env.VITE_NODE_ENV === 'production' && !env.VITE_SENTRY_DSN) {
      result.warnings.push('Error monitoring not configured for production');
      result.recommendations.push('Configure VITE_SENTRY_DSN for production error tracking');
    }

    if (env.VITE_SENTRY_DSN) {
      try {
        new URL(env.VITE_SENTRY_DSN);
      } catch {
        result.errors.push('VITE_SENTRY_DSN is not a valid URL');
        result.isValid = false;
      }
    }

    // Check error reporting flag
    if (env.VITE_SENTRY_DSN && !env.VITE_ENABLE_ERROR_REPORTING) {
      result.warnings.push('Sentry DSN configured but error reporting is disabled');
    }

    return result;
  }

  /**
   * Validate security configuration
   */
  validateSecurityConfig(): ConfigValidationResult {
    const result: ConfigValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };

    // Check production security settings
    if (env.VITE_NODE_ENV === 'production') {
      if (!env.VITE_ENABLE_CSRF_PROTECTION) {
        result.warnings.push('CSRF protection is disabled in production');
      }
      
      if (!env.VITE_ENABLE_RATE_LIMITING) {
        result.warnings.push('Rate limiting is disabled in production');
      }
      
      if (!env.VITE_ENABLE_INPUT_SANITIZATION) {
        result.warnings.push('Input sanitization is disabled in production');
      }
    }

    // Validate rate limiting configuration
    if (env.VITE_ENABLE_RATE_LIMITING) {
      if (env.VITE_RATE_LIMIT_MAX_ATTEMPTS < 1) {
        result.errors.push('VITE_RATE_LIMIT_MAX_ATTEMPTS must be greater than 0');
        result.isValid = false;
      }
      
      if (env.VITE_RATE_LIMIT_WINDOW < 1000) {
        result.warnings.push('VITE_RATE_LIMIT_WINDOW is very short (less than 1 second)');
      }
    }

    return result;
  }

  /**
   * Validate all configuration
   */
  validateAll(): ConfigValidationResult {
    const supabase = this.validateSupabaseConfig();
    const payment = this.validatePaymentConfig();
    const monitoring = this.validateMonitoringConfig();
    const security = this.validateSecurityConfig();

    return {
      isValid: supabase.isValid && payment.isValid && monitoring.isValid && security.isValid,
      errors: [...supabase.errors, ...payment.errors, ...monitoring.errors, ...security.errors],
      warnings: [...supabase.warnings, ...payment.warnings, ...monitoring.warnings, ...security.warnings],
      recommendations: [...supabase.recommendations, ...payment.recommendations, ...monitoring.recommendations, ...security.recommendations]
    };
  }

  /**
   * Get configuration summary
   */
  getConfigSummary(): {
    environment: string;
    supabase: boolean;
    payment: boolean;
    monitoring: boolean;
    security: boolean;
    productionReady: boolean;
  } {
    const envStatus = environmentService.getEnvironmentStatus();
    
    return {
      environment: env.VITE_NODE_ENV,
      supabase: envStatus.supabase,
      payment: envStatus.payment,
      monitoring: envStatus.monitoring,
      security: env.VITE_NODE_ENV === 'production' ? 
        (env.VITE_ENABLE_CSRF_PROTECTION && env.VITE_ENABLE_RATE_LIMITING) : true,
      productionReady: environmentService.isProductionReady()
    };
  }
}

// Export singleton instance
export const configValidator = new ConfigValidator();

// Export convenience functions
export const validateSupabaseConfig = () => configValidator.validateSupabaseConfig();
export const validatePaymentConfig = () => configValidator.validatePaymentConfig();
export const validateMonitoringConfig = () => configValidator.validateMonitoringConfig();
export const validateSecurityConfig = () => configValidator.validateSecurityConfig();
export const validateAllConfig = () => configValidator.validateAll();
export const getConfigSummary = () => configValidator.getConfigSummary();

export default configValidator;
