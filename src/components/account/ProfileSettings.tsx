
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { User, Mail, Phone, MapPin, Save } from 'lucide-react';
import { DefaultAddress, isDefaultAddress } from '@/types/address';

const ProfileSettings = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('name, default_address')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          return;
        }

        if (profile) {
          const defaultAddress = profile.default_address && isDefaultAddress(profile.default_address) 
            ? profile.default_address as DefaultAddress 
            : null;

          setFormData(prev => ({
            ...prev,
            name: profile.name || prev.name,
            ...(defaultAddress && {
              phone: defaultAddress.phone || prev.phone,
              address: defaultAddress.address || '',
              city: defaultAddress.city || '',
              state: defaultAddress.state || '',
              pincode: defaultAddress.pincode || '',
              landmark: defaultAddress.landmark || ''
            })
          }));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: formData.name,
          default_address: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            phone: formData.phone,
            landmark: formData.landmark
          }
        });

      if (error) throw error;

      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-playfair font-bold text-naaz-green">Profile Settings</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          disabled={isSaving}
          className="px-4 py-2 bg-naaz-green text-white rounded-lg hover:bg-naaz-green/90 transition-colors disabled:opacity-50 text-sm md:text-base"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="space-y-4 md:space-y-6">
        <div className="flex items-start space-x-3">
          <User className="text-naaz-green mt-1" size={18} />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-naaz-green focus:border-transparent text-sm md:text-base"
              />
            ) : (
              <p className="text-gray-900 text-sm md:text-base">{formData.name || 'Not provided'}</p>
            )}
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Mail className="text-naaz-green mt-1" size={18} />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900 text-sm md:text-base">{formData.email}</p>
            <p className="text-xs text-gray-500">Email cannot be changed here</p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Phone className="text-naaz-green mt-1" size={18} />
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-naaz-green focus:border-transparent text-sm md:text-base"
              />
            ) : (
              <p className="text-gray-900 text-sm md:text-base">{formData.phone || 'Not provided'}</p>
            )}
          </div>
        </div>

        <div className="border-t pt-4 md:pt-6">
          <h3 className="text-base md:text-lg font-semibold text-naaz-green mb-4">Default Shipping Address</h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="text-naaz-green mt-1" size={18} />
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-naaz-green focus:border-transparent text-sm md:text-base resize-none"
                  />
                ) : (
                  <p className="text-gray-900 text-sm md:text-base">{formData.address || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-naaz-green focus:border-transparent text-sm md:text-base"
                  />
                ) : (
                  <p className="text-gray-900 text-sm md:text-base">{formData.city || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-naaz-green focus:border-transparent text-sm md:text-base"
                  />
                ) : (
                  <p className="text-gray-900 text-sm md:text-base">{formData.state || 'Not provided'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-naaz-green focus:border-transparent text-sm md:text-base"
                  />
                ) : (
                  <p className="text-gray-900 text-sm md:text-base">{formData.pincode || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="ml-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
              {isEditing ? (
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-naaz-green focus:border-transparent text-sm md:text-base"
                />
              ) : (
                <p className="text-gray-900 text-sm md:text-base">{formData.landmark || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 md:px-6 py-2 bg-naaz-green text-white rounded-lg hover:bg-naaz-green/90 transition-colors disabled:opacity-50 text-sm md:text-base"
            >
              <Save size={16} />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
