/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Core Application
  readonly VITE_NODE_ENV: 'development' | 'production' | 'test'
  readonly VITE_APP_VERSION: string
  
  // Supabase Configuration
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_SERVICE_ROLE_KEY: string
  
  // API Configuration
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT: string
  
  // Error Monitoring
  readonly VITE_SENTRY_DSN: string
  readonly VITE_SENTRY_ENVIRONMENT: string
  readonly VITE_SENTRY_RELEASE: string
  
  // Payment Configuration
  readonly VITE_PAYPAL_CLIENT_ID: string
  readonly VITE_PAYPAL_CLIENT_SECRET: string
  readonly VITE_PAYPAL_ENVIRONMENT: string
  readonly VITE_PAYPAL_BASE_URL: string
  
  readonly VITE_PAYU_MERCHANT_KEY: string
  readonly VITE_PAYU_MERCHANT_SALT: string
  readonly VITE_PAYU_ENVIRONMENT: string
  readonly VITE_PAYU_BASE_URL: string
  readonly VITE_PAYU_UPI_VPA: string
  
  // File Storage & CDN
  readonly VITE_IMAGE_CDN_URL: string
  readonly VITE_MAX_FILE_SIZE: string
  readonly VITE_ALLOWED_FILE_TYPES: string
  
  // Security Configuration
  readonly VITE_ENABLE_CSRF_PROTECTION: string
  readonly VITE_ENABLE_RATE_LIMITING: string
  readonly VITE_ENABLE_INPUT_SANITIZATION: string
  
  // Rate Limiting
  readonly VITE_RATE_LIMIT_MAX_ATTEMPTS: string
  readonly VITE_RATE_LIMIT_WINDOW: string
  readonly VITE_RATE_LIMIT_BLOCK_DURATION: string
  
  // Feature Flags
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_ERROR_REPORTING: string
  readonly VITE_ENABLE_PERFORMANCE_MONITORING: string
  readonly VITE_ENABLE_PWA: string
  readonly VITE_ENABLE_COMMENTS: string
  readonly VITE_ENABLE_SEARCH_SUGGESTIONS: string
  readonly VITE_ENABLE_SERVICE_WORKER: string
  
  // Email Configuration
  readonly VITE_SMTP_HOST: string
  readonly VITE_SMTP_PORT: string
  readonly VITE_SMTP_USER: string
  readonly VITE_SMTP_PASS: string
  readonly VITE_FROM_EMAIL: string
  
  // Social Media Integration
  readonly VITE_FACEBOOK_APP_ID: string
  readonly VITE_GOOGLE_CLIENT_ID: string
  readonly VITE_TWITTER_API_KEY: string
  
  // Analytics & Tracking
  readonly VITE_GOOGLE_ANALYTICS_ID: string
  readonly VITE_FACEBOOK_PIXEL_ID: string
  
  // Content & Blog Settings
  readonly VITE_BLOG_POSTS_PER_PAGE: string
  readonly VITE_SEARCH_RESULTS_PER_PAGE: string
  
  // Performance & Caching
  readonly VITE_CACHE_TTL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
