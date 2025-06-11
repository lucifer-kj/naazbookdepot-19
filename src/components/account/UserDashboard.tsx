
import React, { useState, useEffect } from 'react';
import { Package, Heart, MapPin, Settings, ShoppingBag, User, Star, TrendingUp, LogOut, Edit3, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useUserOrders } from '@/lib/hooks/useOrders';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const UserDashboard: React.FC = () => {
  const { user, logout, updateProfile, isLoading: isAuthLoading } = useAuth();
  const { data: userOrders, isLoading: isLoadingOrders, error: ordersError } = useUserOrders();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({ full_name: '', phone: '' });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);


  useEffect(() => {
    if (user) {
      setProfileFormData({
        full_name: user.profile?.full_name || user.user_metadata?.full_name || '',
        phone: user.phone || user.user_metadata?.phone || '',
      });
    }
  }, [user, isEditingProfile]);


  if (!user) return null; // Should be handled by parent Account page redirecting if not authenticated

  const recentOrders = userOrders?.slice(0, 3) || [];
  const totalSpent = userOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
  const completedOrders = userOrders?.filter(order => order.status === 'delivered').length || 0;

  const handleLogout = async () => {
    toast.promise(logout(), {
      loading: 'Logging out...',
      success: 'Logged out successfully!',
      error: 'Failed to log out. Please try again.',
    });
    // Navigation will be handled by Account.tsx due to isAuthenticated becoming false
  };

  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    const result = await updateProfile({
      full_name: profileFormData.full_name,
      // phone: profileFormData.phone, // Assuming phone can be updated via profile table
    });

    if (result.success) {
      toast.success('Profile updated successfully!');
      setIsEditingProfile(false);
    } else {
      toast.error(`Error updating profile: ${result.error?.message || 'Unknown error'}`);
    }
    setIsUpdatingProfile(false);
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
              <div className="text-sm text-white/80">Total Spent (Real)
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
              <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
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
              <div className="text-2xl font-bold text-gray-900">12</div>
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
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-playfair font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Package className="mr-3" size={18} />
                View All Orders
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Heart className="mr-3" size={18} />
                My Wishlist
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="mr-3" size={18} />
                Manage Addresses
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <User className="mr-3" size={18} />
                Edit Profile
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-3" size={18} />
                Account Settings
              </Button>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
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
            <Button size="sm" className="w-full mt-4">
              View All Recommendations
            </Button>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-playfair font-bold text-gray-900">Recent Orders</h3>
              <Button variant="outline" size="sm">
                View All Orders
              </Button>
            </div>

            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Order #{order.orderNumber}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(order.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">₹{order.total.toLocaleString()}</div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'delivered' 
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-10 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="text-xs font-medium text-gray-900 truncate max-w-32">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      {order.trackingNumber && (
                        <span className="text-xs text-gray-600">
                          Tracking: {order.trackingNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      {order.status === 'delivered' && (
                        <Button size="sm">
                          Reorder
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
