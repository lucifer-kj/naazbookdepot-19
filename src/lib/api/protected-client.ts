
import { supabase } from '@/integrations/supabase/client';

/**
 * Makes an authenticated API call to a Supabase Edge Function
 * Automatically adds the current session token as Authorization header
 */
export async function callProtectedApi<T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session found');
    }

    // Prepare headers with auth token
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${session.access_token}`);
    
    // Make the authenticated request
    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error || `API request failed with status ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Protected API call failed:', error);
    throw error;
  }
}

/**
 * Log user activity
 */
export async function logActivity(actionType: string, details: Record<string, any> = {}) {
  try {
    return await callProtectedApi('/api/log-activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action_type: actionType,
        details
      }),
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Non-blocking, just log the error
  }
}
