
import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';

const ProfileSettings = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    address: user?.user_metadata?.address || ''
  });

  const handleSave = () => {
    // TODO: Implement profile update logic
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-playfair font-bold text-naaz-green">Profile Settings</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-naaz-green text-white rounded-lg hover:bg-naaz-green/90 transition-colors"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <User className="text-naaz-green" size={20} />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-naaz-green focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{formData.name || 'Not provided'}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Mail className="text-naaz-green" size={20} />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{formData.email}</p>
            <p className="text-xs text-gray-500">Email cannot be changed here</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Phone className="text-naaz-green" size={20} />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-naaz-green focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{formData.phone || 'Not provided'}</p>
            )}
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <MapPin className="text-naaz-green mt-1" size={20} />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            {isEditing ? (
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-naaz-green focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{formData.address || 'Not provided'}</p>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-2 bg-naaz-green text-white rounded-lg hover:bg-naaz-green/90 transition-colors"
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
