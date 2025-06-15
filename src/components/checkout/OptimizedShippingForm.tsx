
import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { DefaultAddress, isDefaultAddress } from '@/types/address';

interface OptimizedShippingFormProps {
  user: any;
  onComplete: (data: any) => void;
}

const OptimizedShippingForm: React.FC<OptimizedShippingFormProps> = ({ user, onComplete }) => {
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    giftMessage: '',
    specialInstructions: ''
  });

  const [shippingOption] = useState('standard');
  const [isLoading, setIsLoading] = useState(false);

  // Load saved address for returning customers
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('name, default_address')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading user profile:', error);
          return;
        }

        if (profile?.default_address && isDefaultAddress(profile.default_address)) {
          const defaultAddress = profile.default_address as DefaultAddress;
          
          setFormData(prev => ({
            ...prev,
            name: profile.name || prev.name,
            phone: defaultAddress.phone || '',
            address: defaultAddress.address || '',
            city: defaultAddress.city || '',
            state: defaultAddress.state || '',
            pincode: defaultAddress.pincode || '',
            landmark: defaultAddress.landmark || ''
          }));
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ ...formData, shippingOption });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <div className="flex items-center mb-4 md:mb-6">
        <MapPin className="text-naaz-green mr-2 md:mr-3" size={20} />
        <h2 className="text-base md:text-xl font-playfair font-semibold text-naaz-green">
          Shipping Information
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green text-sm md:text-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green text-sm md:text-base"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green text-sm md:text-base"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Complete Address *
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green text-sm md:text-base resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green text-sm md:text-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State *
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green text-sm md:text-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PIN Code *
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green text-sm md:text-base"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Landmark (Optional)
          </label>
          <input
            type="text"
            name="landmark"
            value={formData.landmark}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green text-sm md:text-base"
          />
        </div>

        <div className="bg-naaz-green/5 p-3 md:p-4 rounded-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <div className="font-medium text-naaz-green text-sm md:text-base">
                Standard Delivery
              </div>
              <div className="text-xs md:text-sm text-gray-600">
                5-7 business days
              </div>
              <div className="text-xs text-naaz-gold italic">
                May Allah ease your journey of knowledge
              </div>
            </div>
            <div className="text-base md:text-lg font-semibold text-naaz-gold">
              ₹100
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-naaz-green text-white py-2 md:py-3 rounded-lg hover:bg-naaz-green/90 transition-colors font-medium text-sm md:text-base"
        >
          Continue to Payment
        </button>
      </form>
    </div>
  );
};

export default OptimizedShippingForm;
