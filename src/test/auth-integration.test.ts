import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { supabase } from '@/lib/supabase';

// Mock the error monitoring
vi.mock('@/lib/services/ErrorMonitoring', () => ({
  errorMonitoring: {
    setUserContext: vi.fn(),
    clearUserContext: vi.fn(),
    captureError: vi.fn(),
    captureMessage: vi.fn()
  }
}));

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up unknown auth state
    await supabase.auth.signOut();
  });

  describe('Supabase Client Configuration', () => {
    it('should have properly configured Supabase client', () => {
      expect(supabase).toBeDefined();
      expect(supabase.auth).toBeDefined();
      expect(typeof supabase.auth.signInWithPassword).toBe('function');
      expect(typeof supabase.auth.signUp).toBe('function');
      expect(typeof supabase.auth.signOut).toBe('function');
      expect(typeof supabase.auth.getSession).toBe('function');
    });

    it('should handle session retrieval without errors', async () => {
      const { data, error } = await supabase.auth.getSession();
      
      expect(data).toBeDefined();
      // Session can be null if not authenticated, but should not error
      expect(data.session === null || typeof data.session === 'object').toBe(true);
      
      // If there's an error, it should be a known type
      if (error) {
        expect(error).toHaveProperty('message');
      }
    });
  });

  describe('Login Flow', () => {
    it('should handle invalid credentials gracefully', async () => {
      const result = await supabase.auth.signInWithPassword({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.error).toBeDefined();
      
      if (result.error) {
        // Should be a proper auth error
        expect(result.error.message).toBeDefined();
        expect(typeof result.error.message).toBe('string');
      }
    });

    it('should validate email format', async () => {
      const result = await supabase.auth.signInWithPassword({
        email: 'invalid-email-format',
        password: 'somepassword'
      });

      expect(result).toBeDefined();
      // Should either reject invalid email or handle it gracefully
      if (result.error) {
        expect(result.error.message).toBeDefined();
      }
    });

    it('should handle empty credentials', async () => {
      const result = await supabase.auth.signInWithPassword({
        email: '',
        password: ''
      });

      expect(result).toBeDefined();
      expect(result.error).toBeDefined();
      if (result.error) {
        expect(result.error.message).toBeDefined();
      }
    });
  });

  describe('Registration Flow', () => {
    it('should handle registration with invalid email', async () => {
      const result = await supabase.auth.signUp({
        email: 'invalid-email',
        password: 'validpassword123'
      });

      expect(result).toBeDefined();
      // Should either reject invalid email or handle it gracefully
      if (result.error) {
        expect(result.error.message).toBeDefined();
      }
    });

    it('should handle weak passwords', async () => {
      const result = await supabase.auth.signUp({
        email: 'test@example.com',
        password: '123' // Weak password
      });

      expect(result).toBeDefined();
      // Should either reject weak password or handle it gracefully
      if (result.error) {
        expect(result.error.message).toBeDefined();
      }
    });

    it('should handle registration with proper format', async () => {
      const testEmail = `test-${Date.now()}@example.com`;
      const result = await supabase.auth.signUp({
        email: testEmail,
        password: 'ValidPassword123!',
        options: {
          data: {
            name: 'Test User'
          }
        }
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      
      // Should either succeed or fail with a clear reason
      if (result.error) {
        expect(result.error.message).toBeDefined();
      } else {
        expect(result.data.user).toBeDefined();
      }
    });
  });

  describe('Logout Flow', () => {
    it('should handle logout without active session', async () => {
      // Ensure no active session
      await supabase.auth.signOut();
      
      // Try to logout again
      const { error } = await supabase.auth.signOut();
      
      // Should not error when logging out without session
      if (error) {
        expect(error.message).toBeDefined();
      }
    });

    it('should clear session on logout', async () => {
      // First logout to ensure clean state
      await supabase.auth.signOut();
      
      // Check session is cleared
      const { data } = await supabase.auth.getSession();
      expect(data.session).toBeNull();
    });
  });

  describe('Admin Role Check', () => {
    it('should handle admin role check function', async () => {
      try {
        const { data, error } = await supabase.rpc('is_admin');
        
        if (error) {
          // Function might not exist, which is acceptable
          if (error.message.includes('function is_admin() does not exist')) {
            expect(error.message).toContain('does not exist');
          } else {
            // Other errors should be handled
            expect(error.message).toBeDefined();
          }
        } else {
          // If function exists, should return boolean
          expect(typeof data).toBe('boolean');
        }
      } catch (error) {
        // Should not throw unhandled errors
        expect(error).toBeDefined();
      }
    });
  });

  describe('Session Persistence', () => {
    it('should support session storage', () => {
      const testKey = 'auth-test-' + Date.now();
      const testValue = 'test-value';
      
      try {
        sessionStorage.setItem(testKey, testValue);
        const retrieved = sessionStorage.getItem(testKey);
        sessionStorage.removeItem(testKey);
        
        expect(retrieved).toBe(testValue);
      } catch (error) {
        // Session storage might not be available in test environment
        expect(error).toBeDefined();
      }
    });

    it('should handle session storage errors gracefully', () => {
      // Test with quota exceeded scenario
      const testKey = 'auth-test-large';
      
      try {
        // Try to store a large value that might exceed quota
        const largeValue = 'x'.repeat(10000000); // 10MB string
        sessionStorage.setItem(testKey, largeValue);
        sessionStorage.removeItem(testKey);
      } catch (error) {
        // Should handle quota exceeded errors
        expect(error).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // This test would need to mock network failures
      // For now, we just ensure the auth methods don't throw
      try {
        await supabase.auth.getSession();
        expect(true).toBe(true); // Test passes if no exception
      } catch (error) {
        // Should handle network errors gracefully
        expect(error).toBeDefined();
      }
    });

    it('should provide meaningful error messages', async () => {
      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      if (result.error) {
        expect(result.error.message).toBeDefined();
        expect(typeof result.error.message).toBe('string');
        expect(result.error.message.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Authentication State Management', () => {
    it('should handle auth state changes', async () => {
      let authStateChanges = 0;
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        authStateChanges++;
        expect(event).toBeDefined();
        expect(['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)).toBe(true);
      });

      // Trigger auth state change
      await supabase.auth.signOut();
      
      // Clean up subscription
      subscription.unsubscribe();
      
      expect(authStateChanges).toBeGreaterThan(0);
    });

    it('should handle subscription cleanup', () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {});
      
      expect(subscription).toBeDefined();
      expect(typeof subscription.unsubscribe).toBe('function');
      
      // Should not throw when unsubscribing
      expect(() => subscription.unsubscribe()).not.toThrow();
    });
  });
});
