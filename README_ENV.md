# Environment Setup - Quick Start

## 🚀 Quick Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the .env file and update these required variables:**
   ```bash
   # Required - Update with your Supabase project details
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   
   # Required - API endpoint
   VITE_API_BASE_URL=http://localhost:3000
   ```

3. **Optional - Add payment gateway keys (for payment features):**
   ```bash
   # PayPal (for PayPal payments)
   VITE_PAYPAL_CLIENT_ID=your_paypal_client_id_here
   
   # PayU (for PayU payments)
   VITE_PAYU_MERCHANT_KEY=your_payu_merchant_key_here
   VITE_PAYU_MERCHANT_SALT=your_payu_merchant_salt_here
   ```

4. **Optional - Add Sentry for error tracking:**
   ```bash
   VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

## ✅ Validation

Check if your environment is properly configured:
```bash
npm run validate-env
```

## 📚 Full Documentation

For complete environment setup documentation, see [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md)

## 🔧 Interactive Setup

Use the interactive setup wizard:
```bash
npm run setup-env
```

## ⚠️ Important Notes

- Never commit `.env` files to version control
- The application will work with minimal configuration (Supabase + API URL)
- Payment features require payment gateway configuration
- Error tracking requires Sentry configuration