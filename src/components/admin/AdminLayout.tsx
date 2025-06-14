
import React, { useState, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/admin/login');
  }, [logout, navigate]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const navigation = useMemo(() => [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Promo Codes', href: '/admin/promo-codes', icon: Tag },
  ], []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link to="/" className="flex items-center" onClick={closeSidebar}>
            <img src="/lovable-uploads/logo.png" alt="Naaz Books" className="h-8 w-auto" />
            <span className="ml-2 text-xl font-playfair font-bold text-naaz-green">Admin</span>
          </Link>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    isActive
                      ? 'bg-naaz-green text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                  }`}
                  onClick={closeSidebar}
                >
                  <Icon className={`mr-3 h-5 w-5 transition-colors ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar for mobile */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md text-gray-400 hover:text-gray-500 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-medium text-gray-900">Admin Panel</h1>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
