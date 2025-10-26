
import React, { useState, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/context/AuthContext';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  LogOut,
  Menu,
  X,
  Search,
  ChevronLeft,
  Layers,
  Star,
  User
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/admin/login');
  }, [logout, navigate]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const toggleSidebarCollapse = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/products?search=${encodeURIComponent(searchQuery)}`);
    }
  }, [searchQuery, navigate]);

  const navigation = useMemo(() => [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Inventory', href: '/admin/inventory', icon: Layers },
    { name: 'Reviews', href: '/admin/reviews', icon: Star },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'User Profiles', href: '/admin/user-profiles', icon: User },
    { name: 'Promo Codes', href: '/admin/promo-codes', icon: Tag },
  ], []);

  const currentPageTitle = useMemo(() => {
    const currentNav = navigation.find(item => item.href === location.pathname);
    return currentNav?.name || 'Admin Panel';
  }, [location.pathname, navigation]);

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Desktop & Mobile Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
        w-64
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
          <Link 
            to="/" 
            className={`flex items-center transition-opacity duration-300 ${sidebarCollapsed ? 'lg:opacity-0 lg:pointer-events-none' : ''}`}
            onClick={closeSidebar}
          >
            <img src="/lovable-uploads/logo.png" alt="Naaz Books" className="h-8 w-auto flex-shrink-0" />
            <span className="ml-3 text-lg font-playfair font-bold text-naaz-green truncate">
              Admin
            </span>
          </Link>
          
          {/* Mobile close button */}
          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          {/* Desktop collapse toggle */}
          <button
            onClick={toggleSidebarCollapse}
            className={`hidden lg:flex p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-naaz-green text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-naaz-green'
                  }
                  ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}
                `}
                onClick={closeSidebar}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <Icon className={`
                  h-5 w-5 flex-shrink-0 transition-colors
                  ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-naaz-green'}
                  ${sidebarCollapsed ? 'lg:mr-0' : 'mr-3'}
                `} />
                <span className={`truncate transition-opacity duration-300 ${sidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : ''}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className={`flex items-center mb-3 transition-all duration-300 ${sidebarCollapsed ? 'lg:justify-center' : ''}`}>
            <div className="w-10 h-10 bg-naaz-green rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium text-sm">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className={`ml-3 flex-1 min-w-0 transition-opacity duration-300 ${sidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : ''}`}>
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className={`
              flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-red-600 transition-colors
              ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}
            `}
            title={sidebarCollapsed ? 'Sign out' : undefined}
          >
            <LogOut className={`h-4 w-4 text-gray-400 ${sidebarCollapsed ? 'lg:mr-0' : 'mr-3'}`} />
            <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : ''}`}>
              Sign out
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Page title */}
            <h1 className="text-xl font-semibold text-gray-900 lg:text-2xl">
              {currentPageTitle}
            </h1>
          </div>
          
          {/* Search bar */}
          <ResponsiveContainer size="sm" className="hidden md:block">
            <form onSubmit={handleSearch} className="w-full max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products, orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-naaz-green focus:border-transparent bg-gray-50"
                />
              </div>
            </form>
          </ResponsiveContainer>

          {/* User avatar - Desktop */}
          <div className="hidden md:flex items-center">
            <div className="w-8 h-8 bg-naaz-green rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <ResponsiveContainer size="xl" className="h-full py-4 lg:py-6">
            {children}
          </ResponsiveContainer>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
