import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { apiErrorHandler } from './services/apiErrorHandler';
import sentryService from './services/sentryService';
import { getSupabaseConfig, validateRequiredEnvVars, env } from './config/env';

// Validate required environment variables
validateRequiredEnvVars(['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']);

const config = getSupabaseConfig();

export const supabase = createClient<Database>(
  config.url,
  config.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'x-application-name': 'naazbookdepot',
        'x-app-version': env.VITE_APP_VERSION
      }
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Enhanced Supabase error handler
export const handleSupabaseError = (error: any, operation: string, context?: any) => {
  return apiErrorHandler.handleSupabaseError(error, operation, {
    component: 'supabase',
    additionalData: context
  });
};

// Enhanced authentication helpers with error handling
export const signUp = async (email: string, password: string, fullName: string) => {
  return apiErrorHandler.handleApiCall(
    async () => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        throw error;
      }

      sentryService.addBreadcrumb(
        'User signed up successfully',
        'auth',
        'info',
        { email }
      );

      return data;
    },
    'auth/signup',
    'POST',
    {
      action: 'user_signup',
      additionalData: { email }
    }
  );
};

export const signIn = async (email: string, password: string) => {
  return apiErrorHandler.handleApiCall(
    async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      sentryService.addBreadcrumb(
        'User signed in successfully',
        'auth',
        'info',
        { email }
      );

      // Set user context in Sentry
      if (data.user) {
        sentryService.setUserContext(data.user.id, data.user.email);
      }

      return data;
    },
    'auth/signin',
    'POST',
    {
      action: 'user_signin',
      additionalData: { email }
    }
  );
};

export const signOut = async () => {
  return apiErrorHandler.handleApiCall(
    async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      sentryService.addBreadcrumb(
        'User signed out successfully',
        'auth',
        'info'
      );

      // Clear user context in Sentry
      sentryService.clearUserContext();
    },
    'auth/signout',
    'POST',
    {
      action: 'user_signout'
    }
  );
};

export const getCurrentUser = async () => {
  return apiErrorHandler.handleApiCall(
    async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      return session?.user;
    },
    'auth/session',
    'GET',
    {
      action: 'get_current_user'
    }
  );
};