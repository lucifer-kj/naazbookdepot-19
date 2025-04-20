
import { Session, User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  is_admin: boolean;
  is_super_admin: boolean;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  signIn: (email: string, password: string) => Promise<{ success: boolean; user?: User; session?: Session; }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ success: boolean; user?: User; session?: Session; }>;
  signOut: () => Promise<{ success: boolean; }>;
  resetPassword: (email: string) => Promise<{ success: boolean; }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{error?: any, profile?: UserProfile}>;
  reconnect: () => Promise<void>;
}

// Add a type for the RPC function response
export interface UserProfileRPC {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: string | null;
  is_super_admin: boolean | null;
}
