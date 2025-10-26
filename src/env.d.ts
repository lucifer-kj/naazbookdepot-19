/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_NODE_ENV: 'development' | 'production' | 'test'
  readonly VITE_API_BASE_URL: string
  readonly VITE_IMAGE_CDN_URL: string
  readonly VITE_RATE_LIMIT_MAX_ATTEMPTS: string
  readonly VITE_RATE_LIMIT_WINDOW: string
  readonly VITE_RATE_LIMIT_BLOCK_DURATION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}