/**
 * Console Error Fixes
 * 
 * This file contains fixes for common console errors and warnings
 */

import { environmentService } from '../services/environmentService';
import { apiErrorHandler } from '../services/apiErrorHandler';

// Fix for multiple Supabase client instances
let supabaseClientInitialized = false;

export function preventMultipleSupabaseClients() {
  if (supabaseClientInitialized) {
    apiErrorHandler.logWarning('Supabase client already initialized. Skipping duplicate initialization.', {
      component: 'supabase',
      action: 'client_initialization'
    });
    return false;
  }
  supabaseClientInitialized = true;
  return true;
}

// Environment validation with user-friendly messages
export function validateEnvironment() {
  const validation = environmentService.initialize();
  
  if (!validation.isValid) {
    const instructions = environmentService.getSetupInstructions();
    apiErrorHandler.logError(new Error('Environment validation failed'), {
      component: 'environment',
      action: 'validation',
      additionalData: {
        missingRequired: validation.missingRequired,
        errors: validation.errors,
        setupInstructions: instructions
      }
    });
    return false;
  }

  return true;
}

// Network error handler with retry logic
export function handleNetworkError(error: Error, retryFn?: () => void) {
  let errorContext = 'network_error';
  let userMessage = 'Network error occurred';

  if (error.message?.includes('ERR_NAME_NOT_RESOLVED')) {
    errorContext = 'dns_resolution_failed';
    userMessage = 'DNS resolution failed. Check your internet connection.';
    
    if (retryFn) {
      apiErrorHandler.logInfo('Retrying network request in 5 seconds...', {
        component: 'network',
        action: 'retry_scheduled'
      });
      setTimeout(retryFn, 5000);
    }
  } else if (error.message?.includes('Failed to fetch')) {
    errorContext = 'fetch_failed';
    userMessage = 'Network request failed. Check your connection and server status.';
  }

  apiErrorHandler.logError(error, {
    component: 'network',
    action: errorContext,
    additionalData: { userMessage }
  });
}

// Database connection test with helpful feedback
export async function testDatabaseConnection() {
  try {
    const { supabase } = await import('../supabase');
    
    apiErrorHandler.logInfo('Testing database connection...', {
      component: 'database',
      action: 'connection_test'
    });
    
    const { data, error } = await supabase
      .from('categories')
      .select('id')
      .limit(1);

    if (error) {
      let troubleshootingTip = 'Check your Supabase configuration';
      
      if (error.message.includes('JWT')) {
        troubleshootingTip = 'This might be a token issue. Check your Supabase keys.';
      } else if (error.message.includes('permission')) {
        troubleshootingTip = 'This might be a permissions issue. Check your RLS policies.';
      }
      
      apiErrorHandler.logError(new Error(`Database connection failed: ${error.message}`), {
        component: 'database',
        action: 'connection_test_failed',
        additionalData: { 
          supabaseError: error,
          troubleshootingTip 
        }
      });
      
      return false;
    }

    apiErrorHandler.logInfo('Database connection successful', {
      component: 'database',
      action: 'connection_test_success'
    });
    return true;
  } catch (error) {
    handleNetworkError(error as Error);
    return false;
  }
}

// Initialize fixes
export function initializeErrorFixes() {
  // Validate environment on startup
  validateEnvironment();
  
  // Test database connection
  testDatabaseConnection();
  
  // Log development tools recommendation
  if (import.meta.env.DEV) {
    apiErrorHandler.logInfo('Install React DevTools for better development experience: https://reactjs.org/link/react-devtools', {
      component: 'development',
      action: 'devtools_recommendation'
    });
  }
}

// Auto-initialize when imported
initializeErrorFixes();
