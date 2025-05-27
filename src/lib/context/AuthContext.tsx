
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  joinDate: string;
  isEmailVerified: boolean;
  preferredLanguage: string;
  newsletterSubscribed: boolean;
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
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
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
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
  orders: Order[];
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data
const mockUser: User = {
  id: '1',
  name: 'Ahmed Hassan',
  email: 'ahmed.hassan@email.com',
  phone: '+91 98765 43210',
  joinDate: '2023-06-15',
  isEmailVerified: true,
  preferredLanguage: 'English',
  newsletterSubscribed: true,
};

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'NBD-2024-001',
    date: '2024-01-15',
    status: 'delivered',
    total: 2850,
    items: [
      {
        id: '1',
        title: 'Sahih Al-Bukhari (Complete Set)',
        author: 'Imam Bukhari',
        price: 1500,
        quantity: 1,
        image: '/lovable-uploads/32ec431a-75d3-4c97-bc76-64ac1f937b4f.png'
      },
      {
        id: '2',
        title: 'Tafseer Ibn Katheer (Abridged)',
        author: 'Ibn Katheer',
        price: 1350,
        quantity: 1,
        image: '/lovable-uploads/35ff87ed-b986-45b1-9c00-555f9d78c627.png'
      }
    ],
    shippingAddress: {
      id: '1',
      type: 'home',
      name: 'Ahmed Hassan',
      line1: '123 Park Street',
      line2: 'Apartment 4B',
      city: 'Kolkata',
      state: 'West Bengal',
      postalCode: '700016',
      country: 'India',
      isDefault: true
    },
    trackingNumber: 'TRK123456789'
  },
  {
    id: '2',
    orderNumber: 'NBD-2024-002',
    date: '2024-01-20',
    status: 'shipped',
    total: 950,
    items: [
      {
        id: '3',
        title: 'Stories of the Prophets',
        author: 'Ibn Katheer',
        price: 450,
        quantity: 1,
        image: '/lovable-uploads/61ad7a88-c8e2-42f6-b3b1-567415b3c17e.png'
      },
      {
        id: '4',
        title: 'The Sealed Nectar',
        author: 'Safi-ur-Rahman al-Mubarakpuri',
        price: 500,
        quantity: 1,
        image: '/lovable-uploads/62fd92cc-0660-4c44-a99d-c69c5be673cb.png'
      }
    ],
    shippingAddress: {
      id: '1',
      type: 'home',
      name: 'Ahmed Hassan',
      line1: '123 Park Street',
      line2: 'Apartment 4B',
      city: 'Kolkata',
      state: 'West Bengal',
      postalCode: '700016',
      country: 'India',
      isDefault: true
    },
    trackingNumber: 'TRK987654321'
  }
];

const mockAddresses: Address[] = [
  {
    id: '1',
    type: 'home',
    name: 'Ahmed Hassan',
    line1: '123 Park Street',
    line2: 'Apartment 4B',
    city: 'Kolkata',
    state: 'West Bengal',
    postalCode: '700016',
    country: 'India',
    isDefault: true
  },
  {
    id: '2',
    type: 'work',
    name: 'Ahmed Hassan',
    line1: '456 Corporate Tower',
    line2: 'Floor 8, Office 802',
    city: 'Kolkata',
    state: 'West Bengal',
    postalCode: '700001',
    country: 'India',
    isDefault: false
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [orders] = useState<Order[]>(mockOrders);
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in real app, this would call an API
    if (email && password) {
      setUser(mockUser);
      localStorage.setItem('naaz_user', JSON.stringify(mockUser));
      return true;
    }
    return false;
  };

  const register = async (userData: any): Promise<boolean> => {
    // Mock registration
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      joinDate: new Date().toISOString().split('T')[0],
      isEmailVerified: false,
      preferredLanguage: 'English',
      newsletterSubscribed: userData.newsletter || false,
    };
    setUser(newUser);
    localStorage.setItem('naaz_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('naaz_user');
  };

  const updateProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('naaz_user', JSON.stringify(updatedUser));
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

  // Load user from localStorage on mount
  React.useEffect(() => {
    const storedUser = localStorage.getItem('naaz_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    orders,
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
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
