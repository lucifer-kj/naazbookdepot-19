/**
 * Console Error Fixes
 * 
 * This file contains fixes for common console errors and warnings
 */

// Fix for multiple Supabase client instances
let supabaseClientInitialized = false;

export function preventMultipleSupabaseClients() {
  if (supabaseClientInitialized) {
    console.warn('Supabase client already initialized. Skipping duplicate initialization.');
    return false;
  }
  supabaseClientInitialized = true;
  return true;
}

// Environment validation with user-friendly messages
export function validateEnvironment() {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    console.log('💡 To fix this:');
    console.log('1. Copy .env.example to .env');
    console.log('2. Fill in your Supabase project details');
    console.log('3. Restart the development server');
    return false;
  }

  // Check for URL mismatch
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.includes('tyjnywhsynuwgclpehtx')) {
    console.warn('⚠️  Supabase URL mismatch detected. Please check your .env file.');
  }

  console.log('✅ Environment validation passed');
  return true;
}

// Network error handler with retry logic
export function handleNetworkError(error: Error, retryFn?: () => void) {
  if (error.message?.includes('ERR_NAME_NOT_RESOLVED')) {
    console.error('🌐 DNS resolution failed. Check your internet connection.');
    
    if (retryFn) {
      console.log('🔄 Retrying in 5 seconds...');
      setTimeout(retryFn, 5000);
    }
    return;
  }

  if (error.message?.includes('Failed to fetch')) {
    console.error('📡 Network request failed. Check your connection and server status.');
    return;
  }

  console.error('❌ Network error:', error.message);
}

// Database connection test with helpful feedback
export async function testDatabaseConnection() {
  try {
    const { supabase } = await import('../supabase');
    
    console.log('🔍 Testing database connection...');
    
    const { data, error } = await supabase
      .from('products')
      .select('count()')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      
      if (error.message.includes('JWT')) {
        console.log('💡 This might be a token issue. Check your Supabase keys.');
      } else if (error.message.includes('permission')) {
        console.log('💡 This might be a permissions issue. Check your RLS policies.');
      }
      
      return false;
    }

    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    handleNetworkError(error);
    return false;
  }
}

// Initialize fixes
export function initializeErrorFixes() {
  // Validate environment on startup
  validateEnvironment();
  
  // Test database connection
  testDatabaseConnection();
  
  // Suppress React DevTools warning in development
  if (import.meta.env.DEV) {
    console.log('💡 Install React DevTools for better development experience:');
    console.log('   https://reactjs.org/link/react-devtools');
  }
}

// Auto-initialize when imported
initializeErrorFixes();