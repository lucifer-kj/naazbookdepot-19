import React from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AdminHeader: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error logging out:', error.message);
        // Optionally, display an error message to the user
      } else {
        navigate('/admin/login');
      }
    } catch (err) {
      console.error('Unexpected error during logout:', err);
      // Optionally, display an error message to the user
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <div className="font-playfair font-bold text-naaz-green text-xl">Admin Panel</div>
      <div className="flex items-center gap-4">
        <button className="relative">
          <Bell size={22} className="text-naaz-green" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="bg-naaz-green text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">A</span>
          <span className="font-medium text-naaz-green">Admin</span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
