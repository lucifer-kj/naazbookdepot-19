
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface UserRole {
  id: string;
  role: 'super_admin' | 'admin' | 'inventory_manager' | 'customer';
  created_at: string;
}

interface AuthUser extends User {
  roles?: UserRole[];
  name?: string;
  joinDate?: string;
}

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  total: number;
  items: Array<{
    id: string;
    title: string;
    author: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  shippingAddress: Address;
  trackingNumber?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error?: any }>;
  register: (userData: any) => Promise<{ error?: any }>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<AuthUser>) => Promise<void>;
  orders: Order[];
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);

  const fetchUserRoles = async (userId: string): Promise<UserRole[]> => {
    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      return (roles || []).map(role => ({
        ...role,
        role: role.role as 'super_admin' | 'admin' | 'inventory_manager' | 'customer'
      }));
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
      return [];
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  };

  const register = async (userData: { email: string; password: string; name: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      return { error };
    }

    return { error: null };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateProfile = async (userData: Partial<AuthUser>) => {
    if (!user) return;

    const { error } = await supabase.auth.updateUser({
      data: userData,
    });

    if (error) {
      console.error('Error updating profile:', error);
    }
  };

  const addAddress = (address: Omit<Address, 'id'>) => {
    const newAddress: Address = {
      ...address,
      id: Date.now().toString()
    };
    setAddresses(prev => [...prev, newAddress]);
  };

  const updateAddress = (id: string, addressData: Partial<Address>) => {
    setAddresses(prev => 
      prev.map(addr => addr.id === id ? { ...addr, ...addressData } : addr)
    );
  };

  const deleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  useEffect(() => {
    let didCancel = false;
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (didCancel) return;
        
        console.log('Auth state change:', event, !!session);
        setSession(session);
        
        if (session?.user) {
          // Set user immediately for faster UI response
          const userData = { 
            ...session.user, 
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User', 
            joinDate: session.user.created_at 
          };
          setUser(userData);
          
          // Fetch roles in background with proper error handling
          setTimeout(async () => {
            if (!didCancel) {
              try {
                const roles = await fetchUserRoles(session.user.id);
                console.log('Fetched roles:', roles);
                if (!didCancel) {
                  setUser(prev => prev ? { ...prev, roles } : null);
                }
              } catch (error) {
                console.error('Failed to fetch user roles:', error);
                // Don't block the UI if role fetching fails
              }
            }
          }, 0);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (didCancel) return;
      
      console.log('Initial session check:', !!session);
      setSession(session);
      
      if (session?.user) {
        const userData = { 
          ...session.user, 
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User', 
          joinDate: session.user.created_at 
        };
        setUser(userData);
        
        // Fetch roles with proper error handling
        setTimeout(async () => {
          if (!didCancel) {
            try {
              const roles = await fetchUserRoles(session.user.id);
              console.log('Initial roles fetch:', roles);
              if (!didCancel) {
                setUser(prev => prev ? { ...prev, roles } : null);
              }
            } catch (error) {
              console.error('Failed to fetch initial user roles:', error);
              // Don't block the UI if role fetching fails
            }
          }
        }, 0);
      }
      setLoading(false);
    }).catch((error) => {
      console.error('Session check error:', error);
      setLoading(false);
    });

    // Always resolve loading after 3 seconds max (fallback)
    const timeout = setTimeout(() => {
      if (!didCancel) {
        console.log('Loading timeout reached, setting loading to false');
        setLoading(false);
      }
    }, 3000);

    return () => {
      didCancel = true;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = user?.roles?.some(role => 
    ['super_admin', 'admin', 'inventory_manager'].includes(role.role)
  ) || false;

  console.log('Auth context state:', { 
    user: !!user, 
    isAdmin, 
    roles: user?.roles, 
    loading 
  });

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    isAdmin,
    login,
    register,
    logout,
    updateProfile,
    orders,
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
