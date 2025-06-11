import React from 'react';
import { Button } from '@/components/ui/button';
import { Package, Heart, MapPin, Settings, User, LogOut, Edit3, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // For navigation

interface DashboardQuickActionsProps {
  onEditProfile: () => void;
  onLogout: () => Promise<void>;
  isAuthLoading: boolean;
}

const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({
  onEditProfile,
  onLogout,
  isAuthLoading,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-playfair font-bold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => navigate('/account/orders')} // Navigate to full orders page
        >
          <Package className="mr-3" size={18} />
          View All Orders
        </Button>
        <Button variant="outline" className="w-full justify-start" disabled>
          <Heart className="mr-3" size={18} />
          My Wishlist
        </Button>
        <Button variant="outline" className="w-full justify-start" disabled>
          <MapPin className="mr-3" size={18} />
          Manage Addresses
        </Button>
        <Button variant="outline" className="w-full justify-start" onClick={onEditProfile}>
          <Edit3 className="mr-3" size={18} />
          Edit Profile
        </Button>
        <Button variant="outline" className="w-full justify-start" disabled>
          <Settings className="mr-3" size={18} />
          Account Settings
        </Button>
        <Button
          variant="destructiveOutline"
          className="w-full justify-start"
          onClick={onLogout}
          disabled={isAuthLoading}
        >
          {isAuthLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <LogOut className="mr-3" size={18} />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default DashboardQuickActions;
