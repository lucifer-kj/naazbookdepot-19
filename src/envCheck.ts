// For development debugging only
console.log('Environment check at startup:', {
  hasSupabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  nodeEnv: import.meta.env.VITE_NODE_ENV,
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
});