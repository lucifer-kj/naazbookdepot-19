import { z } from 'zod';

// Environment variable schema for validation
const envSchema = z.object({
  // Supabase Configuration
  VITE_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  VITE_SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Sentry Configuration
  VITE_SENTRY_DSN: z.string().url('Invalid Sentry DSN').optional(),
  VITE_SENTRY_ENVIRONMENT: z.string().default('development'),
  VITE_SENTRY_RELEASE: z.string().optional(),

  // Environment
  VITE_NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VITE_APP_VERSION: z.string().default('1.0.0'),

  // API Configuration
  VITE_API_BASE_URL: z.string().url('Invalid API base URL'),
  VITE_API_TIMEOUT: z.string().transform(Number).pipe(z.number().positive()).default('30000'),

  // Payment Configuration
  VITE_PAYPAL_CLIENT_ID: z.string().optional(),
  VITE_PAYPAL_CLIENT_SECRET: z.string().optional(),
  VITE_PAYPAL_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),
  VITE_PAYPAL_BASE_URL: z.string().url().optional(),
  
  VITE_PAYU_MERCHANT_KEY: z.string().optional(),
  VITE_PAYU_MERCHANT_SALT: z.string().optional(),
  VITE_PAYU_ENVIRONMENT: z.enum(['test', 'production']).default('test'),
  VITE_PAYU_BASE_URL: z.string().url().optional(),
  VITE_PAYU_UPI_VPA: z.string().optional(),

  // Image and File Storage
  VITE_IMAGE_CDN_URL: z.string().url('Invalid image CDN URL').optional(),
  VITE_MAX_FILE_SIZE: z.string().transform(Number).pipe(z.number().positive()).default('5242880'), // 5MB
  VITE_ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/webp'),

  // Rate Limiting
  VITE_RATE_LIMIT_MAX_ATTEMPTS: z.string().transform(Number).pipe(z.number().positive()).default('5'),
  VITE_RATE_LIMIT_WINDOW: z.string().transform(Number).pipe(z.number().positive()).default('60000'), // 1 minute
  VITE_RATE_LIMIT_BLOCK_DURATION: z.string().transform(Number).pipe(z.number().positive()).default('300000'), // 5 minutes

  // Security
  VITE_ENABLE_CSRF_PROTECTION: z.string().transform(val => val === 'true').default('true'),
  VITE_ENABLE_RATE_LIMITING: z.string().transform(val => val === 'true').default('true'),
  VITE_ENABLE_INPUT_SANITIZATION: z.string().transform(val => val === 'true').default('true'),

  // Feature Flags
  VITE_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  VITE_ENABLE_ERROR_REPORTING: z.string().transform(val => val === 'true').default('true'),
  VITE_ENABLE_PERFORMANCE_MONITORING: z.string().transform(val => val === 'true').default('false'),
  VITE_ENABLE_PWA: z.string().transform(val => val === 'true').default('true'),

  // Email Configuration (for contact forms, etc.)
  VITE_SMTP_HOST: z.string().optional(),
  VITE_SMTP_PORT: z.string().transform(Number).pipe(z.number().positive()).optional(),
  VITE_SMTP_USER: z.string().optional(),
  VITE_SMTP_PASS: z.string().optional(),
  VITE_FROM_EMAIL: z.string().email('Invalid from email').optional(),

  // Social Media Integration
  VITE_FACEBOOK_APP_ID: z.string().optional(),
  VITE_GOOGLE_CLIENT_ID: z.string().optional(),
  VITE_TWITTER_API_KEY: z.string().optional(),

  // Analytics
  VITE_GOOGLE_ANALYTICS_ID: z.string().optional(),
  VITE_FACEBOOK_PIXEL_ID: z.string().optional(),

  // Blog and Content
  VITE_BLOG_POSTS_PER_PAGE: z.string().transform(Number).pipe(z.number().positive()).default('10'),
  VITE_ENABLE_COMMENTS: z.string().transform(val => val === 'true').default('true'),

  // Search Configuration
  VITE_SEARCH_RESULTS_PER_PAGE: z.string().transform(Number).pipe(z.number().positive()).default('20'),
  VITE_ENABLE_SEARCH_SUGGESTIONS: z.string().transform(val => val === 'true').default('true'),

  // Cache Configuration
  VITE_CACHE_TTL: z.string().transform(Number).pipe(z.number().positive()).default('300000'), // 5 minutes
  VITE_ENABLE_SERVICE_WORKER: z.string().transform(val => val === 'true').default('true'),
});

// Parse and validate environment variables
function parseEnv() {
  try {
    return envSchema.parse(import.meta.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // In development, log warnings but don't fail
      if (import.meta.env.MODE === 'development') {
        import('../utils/consoleMigration').then(({ logWarning }) => {
          logWarning('Environment validation warnings detected');
          error.errors.forEach(err => {
            logWarning(`Environment validation: ${err.path.join('.')}: ${err.message}`);
          });
        });
        
        // Return a safe default configuration for development
        return envSchema.partial().parse(import.meta.env);
      }
      
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('\n');
      
      throw new Error(`Environment validation failed:\n${errorMessages}`);
    }
    throw error;
  }
}

// Export validated environment configuration
export const env = parseEnv();

// Type for the environment configuration
export type EnvConfig = z.infer<typeof envSchema>;

// Helper functions for common environment checks
export const isDevelopment = () => env.VITE_NODE_ENV === 'development';
export const isProduction = () => env.VITE_NODE_ENV === 'production';
export const isTest = () => env.VITE_NODE_ENV === 'test';

// Feature flag helpers
export const isFeatureEnabled = (feature: keyof Pick<EnvConfig, 
  'VITE_ENABLE_ANALYTICS' | 
  'VITE_ENABLE_ERROR_REPORTING' | 
  'VITE_ENABLE_PERFORMANCE_MONITORING' | 
  'VITE_ENABLE_PWA' |
  'VITE_ENABLE_CSRF_PROTECTION' |
  'VITE_ENABLE_RATE_LIMITING' |
  'VITE_ENABLE_INPUT_SANITIZATION' |
  'VITE_ENABLE_COMMENTS' |
  'VITE_ENABLE_SEARCH_SUGGESTIONS' |
  'VITE_ENABLE_SERVICE_WORKER'
>) => {
  return env[feature];
};

// Payment configuration helpers
export const getPaymentConfig = () => ({
  paypal: {
    clientId: env.VITE_PAYPAL_CLIENT_ID,
    environment: env.VITE_PAYPAL_ENVIRONMENT,
    enabled: !!(env.VITE_PAYPAL_CLIENT_ID && env.VITE_PAYPAL_CLIENT_SECRET),
  },
  payu: {
    merchantKey: env.VITE_PAYU_MERCHANT_KEY,
    environment: env.VITE_PAYU_ENVIRONMENT,
    enabled: !!(env.VITE_PAYU_MERCHANT_KEY && env.VITE_PAYU_MERCHANT_SALT),
  },
});

// File upload configuration
export const getFileUploadConfig = () => ({
  maxSize: env.VITE_MAX_FILE_SIZE,
  allowedTypes: env.VITE_ALLOWED_FILE_TYPES.split(','),
  cdnUrl: env.VITE_IMAGE_CDN_URL,
});

// Rate limiting configuration
export const getRateLimitConfig = () => ({
  maxAttempts: env.VITE_RATE_LIMIT_MAX_ATTEMPTS,
  window: env.VITE_RATE_LIMIT_WINDOW,
  blockDuration: env.VITE_RATE_LIMIT_BLOCK_DURATION,
  enabled: env.VITE_ENABLE_RATE_LIMITING,
});

// API configuration
export const getApiConfig = () => ({
  baseUrl: env.VITE_API_BASE_URL,
  timeout: env.VITE_API_TIMEOUT,
});

// Supabase configuration
export const getSupabaseConfig = () => ({
  url: env.VITE_SUPABASE_URL,
  anonKey: env.VITE_SUPABASE_ANON_KEY,
  serviceRoleKey: env.VITE_SUPABASE_SERVICE_ROLE_KEY,
});

// Sentry configuration
export const getSentryConfig = () => ({
  dsn: env.VITE_SENTRY_DSN,
  environment: env.VITE_SENTRY_ENVIRONMENT,
  release: env.VITE_SENTRY_RELEASE,
  enabled: !!env.VITE_SENTRY_DSN && env.VITE_ENABLE_ERROR_REPORTING,
});

// Validation helper for runtime environment checks
export const validateRequiredEnvVars = (requiredVars: (keyof EnvConfig)[]) => {
  const missing = requiredVars.filter(varName => !env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

export default env;