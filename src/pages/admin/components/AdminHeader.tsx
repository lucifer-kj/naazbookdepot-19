import React from 'react';
import { Bell } from 'lucide-react';

const AdminHeader: React.FC = () => (
  <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
    <div className="font-playfair font-bold text-naaz-green text-xl">Admin Panel</div>
    <div className="flex items-center gap-4">
      <button className="relative">
        <Bell size={22} className="text-naaz-green" />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
      </button>
      <div className="flex items-center gap-2">
        <span className="bg-naaz-green text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">N</span>
        <span className="font-medium text-naaz-green">Admin</span>
      </div>
    </div>
  </header>
);

export default AdminHeader;
