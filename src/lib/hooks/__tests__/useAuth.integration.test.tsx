import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../useAuth';
import { supabase } from '../../supabase';
import { mockUser } from '../../../test/utils';

// Mock Supabase
vi.mock('../../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    }))
  }
}));

// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' })
}));

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useAuth Integration Tests', () => {
  let mockAuthStateCallback: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthStateCallback = null;
    
    (supabase.auth.onAuthStateChange as any).mockImplementation((callback: any) => {
      mockAuthStateCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn()
          }
        }
      };
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Authentication State Management', () => {
    it('should initialize with authenticated user', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null
      });

      const mockSupabaseFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...mockUser, role: 'customer' },
          error: null
        })
      };
      (supabase.from as any).mockReturnValue(mockSupabaseFrom);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email
        }));
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should initialize with no user when not authenticated', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle auth state changes', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });

      // Simulate login via auth state change
      const mockSupabaseFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...mockUser, role: 'customer' },
          error: null
        })
      };
      (supabase.from as any).mockReturnValue(mockSupabaseFrom);

      act(() => {
        mockAuthStateCallback('SIGNED_IN', { user: mockUser });
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toEqual(expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email
        }));
      });
    });
  });

  describe('Sign Up Flow', () => {
    it('should handle successful sign up', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      (supabase.auth.signUp as any).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null
      });

      const mockSupabaseFrom = {
        insert: vi.fn().mockResolvedValue({
          data: { ...mockUser, role: 'customer' },
          error: null
        })
      };
      (supabase.from as any).mockReturnValue(mockSupabaseFrom);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.signUp({
          email: 'test@example.com',
          password: 'Password123!',
          fullName: 'Test User'
        });
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
        options: {
          data: {
            full_name: 'Test User'
          }
        }
      });

      expect(mockSupabaseFrom.insert).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        full_name: 'Test User',
        role: 'customer'
      });
    });

    it('should handle sign up errors', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      (supabase.auth.signUp as any).mockResolvedValue({
        data: null,
        error: { message: 'Email already registered' }
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await expect(
        act(async () => {
          await result.current.signUp({
            email: 'test@example.com',
            password: 'Password123!',
            fullName: 'Test User'
          });
        })
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('Sign In Flow', () => {
    it('should handle successful sign in', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: mockUser, session: { user: mockUser } },
        error: null
      });

      const mockSupabaseFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...mockUser, role: 'customer' },
          error: null
        })
      };
      (supabase.from as any).mockReturnValue(mockSupabaseFrom);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.signIn({
          email: 'test@example.com',
          password: 'Password123!'
        });
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!'
      });
    });

    it('should handle sign in errors', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' }
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await expect(
        act(async () => {
          await result.current.signIn({
            email: 'test@example.com',
            password: 'wrongpassword'
          });
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('Sign Out Flow', () => {
    it('should handle successful sign out', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null
      });

      const mockSupabaseFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...mockUser, role: 'customer' },
          error: null
        })
      };
      (supabase.from as any).mockReturnValue(mockSupabaseFrom);

      (supabase.auth.signOut as any).mockResolvedValue({
        error: null
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(supabase.auth.signOut).toHaveBeenCalled();

      // Simulate auth state change for sign out
      act(() => {
        mockAuthStateCallback('SIGNED_OUT', null);
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
      });
    });
  });

  describe('Password Reset Flow', () => {
    it('should handle password reset request', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({
        data: {},
        error: null
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.resetPassword('test@example.com');
      });

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: expect.stringContaining('/reset-password')
        }
      );
    });

    it('should handle password reset errors', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
        error: null
      });

      (supabase.auth.resetPasswordForEmail as any).mockResolvedValue({
        data: null,
        error: { message: 'Email not found' }
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await expect(
        act(async () => {
          await result.current.resetPassword('nonexistent@example.com');
        })
      ).rejects.toThrow('Email not found');
    });
  });

  describe('Profile Update Flow', () => {
    it('should handle profile updates', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null
      });

      const mockSupabaseFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { ...mockUser, role: 'customer' },
          error: null
        }),
        update: vi.fn().mockResolvedValue({
          data: { ...mockUser, full_name: 'Updated Name' },
          error: null
        })
      };
      (supabase.from as any).mockReturnValue(mockSupabaseFrom);

      (supabase.auth.updateUser as any).mockResolvedValue({
        data: { user: { ...mockUser, user_metadata: { full_name: 'Updated Name' } } },
        error: null
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.updateProfile({
          fullName: 'Updated Name'
        });
      });

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        data: { full_name: 'Updated Name' }
      });

      expect(mockSupabaseFrom.update).toHaveBeenCalledWith({
        full_name: 'Updated Name'
      });
    });
  });

  describe('Role-based Access', () => {
    it('should correctly identify admin users', async () => {
      const adminUser = { ...mockUser, role: 'admin' };
      
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null
      });

      const mockSupabaseFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: adminUser,
          error: null
        })
      };
      (supabase.from as any).mockReturnValue(mockSupabaseFrom);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isAdmin).toBe(true);
        expect(result.current.user?.role).toBe('admin');
      });
    });

    it('should correctly identify customer users', async () => {
      const customerUser = { ...mockUser, role: 'customer' };
      
      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: { user: mockUser } },
        error: null
      });

      const mockSupabaseFrom = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: customerUser,
          error: null
        })
      };
      (supabase.from as any).mockReturnValue(mockSupabaseFrom);

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper()
      });

      await waitFor(() => {
        expect(result.current.isAdmin).toBe(false);
        expect(result.current.user?.role).toBe('customer');
      });
    });
  });
});