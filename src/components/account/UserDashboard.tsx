import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, Heart, MapPin, Settings, LogOut, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { useCartContext } from '@/lib/context/CartContext';
import { supabase } from '@/integrations/supabase/client';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const { cart } = useCartContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const dashboardItems = [
    {
      icon: User,
      title: 'Profile Settings',
      description: 'Manage your personal information',
      link: '/account/profile',
      color: 'text-naaz-green'
    },
    {
      icon: Package,
      title: 'Order History',
      description: 'View your past orders and track current ones',
      link: '/account/orders',
      color: 'text-naaz-gold'
    },
    {
      icon: Heart,
      title: 'Wishlist',
      description: 'Your saved items for later',
      link: '/wishlist',
      color: 'text-red-500'
    },
    {
      icon: ShoppingCart,
      title: 'Shopping Cart',
      description: `${cart.totalItems} items in your cart`,
      link: '/cart',
      color: 'text-naaz-green'
    },
    {
      icon: MapPin,
      title: 'Addresses',
      description: 'Manage shipping and billing addresses',
      link: '/account/addresses',
      color: 'text-blue-500'
    },
    {
      icon: Settings,
      title: 'Account Settings',
      description: 'Privacy, security, and preferences',
      link: '/account/settings',
      color: 'text-gray-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-naaz-green rounded-full flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-playfair font-bold text-naaz-green">
              Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}!
            </h1>
            <p className="text-gray-600">Manage your account and track your orders</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Package size={32} className="mx-auto text-naaz-green mb-2" />
          <h3 className="text-xl font-semibold text-gray-900">0</h3>
          <p className="text-gray-600">Total Orders</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <Heart size={32} className="mx-auto text-red-500 mb-2" />
          <h3 className="text-xl font-semibold text-gray-900">0</h3>
          <p className="text-gray-600">Wishlist Items</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <ShoppingCart size={32} className="mx-auto text-naaz-gold mb-2" />
          <h3 className="text-xl font-semibold text-gray-900">{cart.totalItems}</h3>
          <p className="text-gray-600">Cart Items</p>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardItems.map((item, index) => (
          <Link
            key={index}
            to={item.link}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 group"
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors`}>
                <item.icon size={24} className={item.color} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-naaz-green transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Logout Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-900">Account Security</h3>
            <p className="text-sm text-gray-600">Logged in as {user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
