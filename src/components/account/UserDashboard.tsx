import React, { useState, useEffect } from 'react';
import { Package, Heart, MapPin, Settings, Star, TrendingUp, Loader2, AlertTriangle, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // <-- Correct Badge import
import { useUserOrders } from '@/lib/hooks/useOrders';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Import the new sections
import EditProfileModal from './dashboardSections/EditProfileModal';
import DashboardRecentOrders from './dashboardSections/DashboardRecentOrders';
import DashboardQuickActions from './dashboardSections/DashboardQuickActions';

const UserDashboard: React.FC = () => {
  const { user, logout, updateProfile, isLoading: isAuthLoading } = useAuth();
  const { data: userOrders, isLoading: isLoadingOrders, error: ordersError } = useUserOrders();
  const navigate = useNavigate();

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Note: profileFormData and its update logic are now in EditProfileModal.tsx
  // isUpdatingProfile is also managed within EditProfileModal.tsx

  if (!user) return null;

  const recentOrders = userOrders?.slice(0, 3) || [];
  const totalSpent = userOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
  const completedOrders = userOrders?.filter(order => order.status === 'delivered').length || 0;

  const handleLogout = async () => {
    toast.promise(logout(), {
      loading: 'Logging out...',
      success: 'Logged out successfully!',
      error: 'Failed to log out. Please try again.',
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-naaz-green to-naaz-green/80 text-white rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-playfair font-bold mb-2">
              Welcome back, {user.profile?.full_name || user.user_metadata?.full_name || user.email}!
            </h1>
            <p className="text-white/90 font-arabic text-lg mb-1">
              السلام عليكم ورحمة الله وبركاته
            </p>
            <p className="text-white/80 text-sm">
              Member since {format(new Date(user.created_at), "MMMM yyyy")}
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-center">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</div>
              <div className="text-sm text-white/80">Total Spent (Real)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-naaz-green/10 p-3 rounded-lg">
              <Package className="text-naaz-green" size={24} />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{userOrders?.length || 0}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{completedOrders}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-naaz-gold/10 p-3 rounded-lg">
              <Heart className="text-naaz-gold" size={24} />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{userOrders?.length || 0}</div>
              <div className="text-sm text-gray-600">Wishlist Items</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Star className="text-blue-600" size={24} />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">4.8</div>
              <div className="text-sm text-gray-600">Avg. Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <DashboardQuickActions
            onEditProfile={() => setIsEditingProfile(true)}
            onLogout={handleLogout}
            isAuthLoading={isAuthLoading}
          />
          {/* Recommendations can be another component or remain here if simple */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-playfair font-bold text-gray-900 mb-4">
              Recommended for You
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <img
                  src="/lovable-uploads/a8c77a1e-70d0-4c8f-8218-bbff0885a682.png"
                  alt="Book cover"
                  className="w-12 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Fortress of the Muslim</h4>
                  <p className="text-xs text-gray-600">Sa'eed bin Wahf Al-Qahtaani</p>
                  <p className="text-sm font-bold text-naaz-green">₹299</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <img
                  src="/lovable-uploads/35ff87ed-b986-45b1-9c00-555f9d78c627.png"
                  alt="Book cover"
                  className="w-12 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">The Noble Quran</h4>
                  <p className="text-xs text-gray-600">Dr. Muhammad Taqi-ud-Din</p>
                  <p className="text-sm font-bold text-naaz-green">₹850</p>
                </div>
              </div>
            </div>
            <Button size="sm" className="w-full mt-4" disabled>
              View All Recommendations
            </Button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <DashboardRecentOrders
            recentOrders={recentOrders}
            isLoading={isLoadingOrders}
            error={ordersError}
            onViewOrder={(orderId) => navigate(`/account/orders/${orderId}`)}
            onViewAllOrders={() => navigate('/account/orders')}
          />
        </div>
      </div>

      {/* Profile Edit Modal */}
      <EditProfileModal
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        user={user}
        updateProfile={updateProfile}
        isAuthLoading={isAuthLoading}
      />
    </div>
  );
};

export default UserDashboard;
