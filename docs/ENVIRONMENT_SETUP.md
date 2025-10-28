# Environment Setup Guide

This guide explains how to set up environment variables for the Naaz Book Depot application across different environments.

## Quick Start

1. **Copy the appropriate environment template:**
   ```bash
   # For development
   cp .env.example .env
   
   # For production
   cp .env.production.example .env.production
   
   # For local development with overrides
   cp .env.local.example .env.local
   ```

2. **Use the setup wizard:**
   ```bash
   npm run setup-env
   ```

3. **Validate your configuration:**
   ```bash
   npm run validate-env
   ```

## Environment Files

### `.env` (Development)
Main development environment configuration. This file should contain your development-specific settings.

### `.env.production` (Production)
Production environment configuration with production-ready settings and stricter security.

### `.env.local` (Local Overrides)
Local development overrides. This file takes precedence over `.env` and is useful for developer-specific settings.

### `.env.example` (Template)
Template file showing all available environment variables with example values.

## Required Environment Variables

### Core Application Settings
```bash
VITE_NODE_ENV=development|production|test
VITE_APP_VERSION=1.0.0
```

### Supabase Configuration
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key  # Optional
```

### API Configuration
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=30000
```

## Optional Environment Variables

### Error Monitoring (Sentry)
```bash
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_SENTRY_ENVIRONMENT=development|production
VITE_SENTRY_RELEASE=1.0.0
```

### Payment Gateways

#### PayPal
```bash
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
VITE_PAYPAL_CLIENT_SECRET=your_paypal_client_secret
VITE_PAYPAL_ENVIRONMENT=sandbox|production
```

#### PayU
```bash
VITE_PAYU_MERCHANT_KEY=your_payu_merchant_key
VITE_PAYU_MERCHANT_SALT=your_payu_merchant_salt
VITE_PAYU_ENVIRONMENT=test|production
```

### File Storage & CDN
```bash
VITE_IMAGE_CDN_URL=https://your-cdn-domain.com
VITE_MAX_FILE_SIZE=5242880  # 5MB in bytes
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

### Security Configuration
```bash
VITE_ENABLE_CSRF_PROTECTION=true|false
VITE_ENABLE_RATE_LIMITING=true|false
VITE_ENABLE_INPUT_SANITIZATION=true|false

# Rate Limiting Settings
VITE_RATE_LIMIT_MAX_ATTEMPTS=5
VITE_RATE_LIMIT_WINDOW=60000  # 1 minute in milliseconds
VITE_RATE_LIMIT_BLOCK_DURATION=300000  # 5 minutes in milliseconds
```

### Feature Flags
```bash
VITE_ENABLE_ANALYTICS=true|false
VITE_ENABLE_ERROR_REPORTING=true|false
VITE_ENABLE_PERFORMANCE_MONITORING=true|false
VITE_ENABLE_PWA=true|false
VITE_ENABLE_COMMENTS=true|false
VITE_ENABLE_SEARCH_SUGGESTIONS=true|false
VITE_ENABLE_SERVICE_WORKER=true|false
```

### Email Configuration
```bash
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your_email@gmail.com
VITE_SMTP_PASS=your_app_password
VITE_FROM_EMAIL=noreply@yourdomain.com
```

### Social Media Integration
```bash
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_TWITTER_API_KEY=your_twitter_api_key
```

### Analytics & Tracking
```bash
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX-X
VITE_FACEBOOK_PIXEL_ID=your_facebook_pixel_id
```

### Content & Performance
```bash
VITE_BLOG_POSTS_PER_PAGE=10
VITE_SEARCH_RESULTS_PER_PAGE=20
VITE_CACHE_TTL=300000  # 5 minutes in milliseconds
```

## Environment-Specific Recommendations

### Development Environment
- Disable analytics and error reporting
- Use relaxed rate limiting
- Disable CSRF protection for easier testing
- Use sandbox/test payment environments
- Short cache TTL for faster development

### Production Environment
- Enable all security features
- Use strict rate limiting
- Enable error reporting and monitoring
- Use production payment environments
- Longer cache TTL for better performance

### Local Development
- Override specific settings per developer
- Use local Supabase instance if available
- Disable service workers for easier debugging
- Use development email services (Mailtrap, etc.)

## Security Best Practices

1. **Never commit `.env` files to version control**
2. **Use different keys for different environments**
3. **Rotate keys regularly in production**
4. **Use environment-specific Supabase projects**
5. **Enable all security features in production**
6. **Use strong, randomly generated secrets**

## Validation

The application includes built-in environment validation:

```bash
# Validate current environment
npm run validate-env

# Validate before build (automatic)
npm run build
```

## Troubleshooting

### Common Issues

1. **Missing required variables**: Run `npm run validate-env` to see which variables are missing
2. **Invalid URLs**: Ensure all URL variables are properly formatted with protocol
3. **Payment gateway errors**: Verify API keys and environment settings match
4. **Supabase connection issues**: Check URL and key validity in Supabase dashboard

### Getting Help

1. Check the validation output: `npm run validate-env`
2. Review the example files for proper formatting
3. Ensure all placeholder values are replaced with actual values
4. Verify API keys are active and have proper permissions

## Scripts

- `npm run setup-env` - Interactive environment setup wizard
- `npm run validate-env` - Validate environment configuration
- `npm run prebuild` - Automatic validation before build

## Environment Loading Order

Vite loads environment variables in this order (later files override earlier ones):

1. `.env`
2. `.env.local`
3. `.env.[mode]` (e.g., `.env.production`)
4. `.env.[mode].local`

Variables must be prefixed with `VITE_` to be accessible in the client-side code.