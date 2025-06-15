
import type { User, Session } from '@supabase/supabase-js';

export interface UserRole {
  id: string;
  role: 'super_admin' | 'admin' | 'inventory_manager' | 'customer';
  created_at: string;
}

export interface AuthUser extends User {
  roles?: UserRole[];
  name?: string;
  joinDate?: string;
}

export interface Address {
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

export interface Order {
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

export interface AuthContextType {
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
