import React, { useState } from 'react';
import { User, TrendingUp, Star, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { Link } from 'react-router-dom';

interface AccountSlideInProps {
  open: boolean;
  onClose: () => void;
}

const getProfilePicture = (user: any) => user?.profilePicture || '/lovable-uploads/Owner.jpg';
const getOrdersCount = (user: any, orders: any[]) => user?.ordersCount ?? orders?.length ?? 0;
const getRating = (user: any) => user?.rating ?? '4.8';

const AccountSlideIn: React.FC<AccountSlideInProps> = ({ open, onClose }) => {
  const { user, logout, orders } = useAuth();
  if (!user) return null;

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[100] transition-transform duration-500 ease-in-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ maxWidth: '100vw' }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <img
              src={getProfilePicture(user)}
              alt="Profile"
              className="w-14 h-14 rounded-full object-cover border-2 border-naaz-gold shadow"
            />
            <div>
              <h3 className="font-bold text-lg text-naaz-green">{user.name}</h3>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-naaz-gold text-2xl">&times;</button>
        </div>

        {/* Trending/Stats */}
        <div className="flex items-center gap-6 px-6 py-4 border-b bg-gradient-to-r from-naaz-green/10 to-naaz-gold/5">
          <div className="flex flex-col items-center">
            <TrendingUp className="text-naaz-green mb-1" size={24} />
            <span className="text-xs text-gray-500">Orders</span>
            <span className="font-bold text-naaz-green">{getOrdersCount(user, orders)}</span>
          </div>
          <div className="flex flex-col items-center">
            <Star className="text-naaz-gold mb-1" size={24} />
            <span className="text-xs text-gray-500">Rating</span>
            <span className="font-bold text-naaz-gold">{getRating(user)}</span>
          </div>
        </div>

        {/* Account Details */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-naaz-cream/50 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <User className="text-naaz-green" size={18} />
              <span className="font-semibold text-naaz-green">Account Info</span>
            </div>
            <div className="text-sm text-gray-700">
              <div><span className="font-medium">Name:</span> {user.name}</div>
              <div><span className="font-medium">Email:</span> {user.email}</div>
              <div><span className="font-medium">Phone:</span> {user.phone || 'N/A'}</div>
              {/* Location is not in User type, so skip or use a placeholder */}
              {/* <div><span className="font-medium">Location:</span> {user.location || 'N/A'}</div> */}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/account" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-naaz-green/10 transition-colors font-medium text-naaz-green border border-naaz-green/20">
              <Settings size={18} /> Manage Account
            </Link>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors font-medium text-red-600 border border-red-200">
              <LogOut size={18} /> Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSlideIn;
