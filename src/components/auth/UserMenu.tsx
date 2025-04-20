
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/context/AuthContext';
import {
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  UserCircle
} from 'lucide-react';

type MenuItemProps = {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  to?: string;
  active?: boolean;
};

const MenuItem = ({ icon, label, onClick, to, active = false }: MenuItemProps) => {
  const baseClasses = "w-full flex items-center px-4 py-2 rounded-md transition-colors";
  const activeClasses = "bg-naaz-green text-white";
  const inactiveClasses = "hover:bg-naaz-cream text-naaz-green";
  
  const classes = `${baseClasses} ${active ? activeClasses : inactiveClasses}`;
  
  if (to) {
    return (
      <Link to={to} className={classes}>
        {icon}
        <span className="ml-3">{label}</span>
      </Link>
    );
  }
  
  return (
    <button onClick={onClick} className={classes}>
      {icon}
      <span className="ml-3">{label}</span>
    </button>
  );
};

interface UserMenuProps {
  activeItem?: string;
}

const UserMenu = ({ activeItem = 'dashboard' }: UserMenuProps) => {
  const navigate = useNavigate();
  const { signOut, profile, isAdmin } = useAuth();
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6 pb-6 border-b border-gray-200">
        <div className="w-20 h-20 mx-auto bg-naaz-green rounded-full flex items-center justify-center text-white text-2xl font-playfair mb-3">
          {profile?.first_name && profile?.last_name 
            ? `${profile.first_name[0]}${profile.last_name[0]}`
            : profile?.email?.substring(0, 2).toUpperCase() || 'U'
          }
        </div>
        <h3 className="font-medium text-naaz-green">
          {profile?.first_name && profile?.last_name 
            ? `${profile.first_name} ${profile.last_name}`
            : profile?.email || 'User'
          }
        </h3>
        <p className="text-sm text-gray-500">{profile?.email}</p>
      </div>
      
      <nav className="space-y-1">
        <MenuItem
          icon={<User size={18} className="mr-3" />}
          label="Dashboard"
          to="/account"
          active={activeItem === 'dashboard'}
        />
        
        <MenuItem
          icon={<Package size={18} className="mr-3" />}
          label="My Orders"
          to="/account/orders"
          active={activeItem === 'orders'}
        />
        
        <MenuItem
          icon={<Heart size={18} className="mr-3" />}
          label="Wishlist"
          to="/account/wishlist"
          active={activeItem === 'wishlist'}
        />
        
        <MenuItem
          icon={<Settings size={18} className="mr-3" />}
          label="Account Settings"
          to="/account/settings"
          active={activeItem === 'settings'}
        />
        
        {isAdmin && (
          <MenuItem
            icon={<UserCircle size={18} className="mr-3" />}
            label="Admin Panel"
            to="/admin"
            active={activeItem === 'admin'}
          />
        )}
        
        <MenuItem
          icon={<LogOut size={18} className="mr-3" />}
          label="Logout"
          onClick={handleLogout}
        />
      </nav>
    </div>
  );
};

export default UserMenu;
