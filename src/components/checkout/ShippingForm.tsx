
import React, { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';

interface ShippingFormProps {
  user: unknown;
  onComplete: (data: unknown) => void;
}

const ShippingForm: React.FC<ShippingFormProps> = ({ user, onComplete }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
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

  const [shippingOption, setShippingOption] = useState('standard');

  const shippingOptions = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      time: '5-7 business days',
      price: 100,
      blessing: 'May Allah ease your journey of knowledge'
    },
    {
      id: 'express',
      name: 'Express Delivery',
      time: '2-3 business days',
      price: 200,
      blessing: 'Swift delivery with Allah\'s grace'
    },
    {
      id: 'overnight',
      name: 'Overnight Delivery',
      time: '1 business day',
      price: 500,
      blessing: 'Urgent knowledge, blessed delivery'
    }
  ];

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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <MapPin className="text-naaz-green mr-3" size={24} />
        <h2 className="text-xl font-playfair font-semibold text-naaz-green">
          Shipping Information
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green"
            required
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green"
          />
        </div>

        <div>
          <h3 className="text-lg font-playfair font-semibold text-naaz-green mb-4">
            Shipping Options
          </h3>
          <div className="space-y-3">
            {shippingOptions.map((option) => (
              <label
                key={option.id}
                className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                  shippingOption === option.id
                    ? 'border-naaz-green bg-naaz-green/5'
                    : 'border-gray-200 hover:border-naaz-green/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="shippingOption"
                      value={option.id}
                      checked={shippingOption === option.id}
                      onChange={(e) => setShippingOption(e.target.value)}
                      className="text-naaz-green"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-naaz-green">
                        {option.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {option.time}
                      </div>
                      <div className="text-xs text-naaz-gold italic">
                        {option.blessing}
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-naaz-gold">
                    ₹{option.price}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gift Message (Optional)
          </label>
          <textarea
            name="giftMessage"
            value={formData.giftMessage}
            onChange={handleInputChange}
            rows={2}
            placeholder="Add a special Islamic greeting or message..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Instructions (Optional)
          </label>
          <textarea
            name="specialInstructions"
            value={formData.specialInstructions}
            onChange={handleInputChange}
            rows={2}
            placeholder="unknown special delivery instructions..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-naaz-green"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-naaz-green text-white py-3 rounded-lg hover:bg-naaz-green/90 transition-colors font-medium"
        >
          Continue to Payment
        </button>
      </form>
    </div>
  );
};

export default ShippingForm;
