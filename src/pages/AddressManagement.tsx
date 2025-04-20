
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import UserMenu from '../components/auth/UserMenu';
import { useAuth } from '@/lib/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Edit, Check } from 'lucide-react';

interface Address {
  id: string;
  user_id: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

const AddressManagement = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  
  // Form state
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false });
          
        if (error) throw error;
        setAddresses(data || []);
      } catch (error) {
        console.error('Error fetching addresses:', error);
        toast.error('Failed to load addresses');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAddresses();
  }, [user]);
  
  const resetForm = () => {
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setState('');
    setPostalCode('');
    setCountry('India');
    setIsDefault(false);
    setEditingAddressId(null);
  };
  
  const handleAddAddress = () => {
    resetForm();
    setShowAddForm(true);
  };
  
  const handleEditAddress = (address: Address) => {
    setAddressLine1(address.address_line1);
    setAddressLine2(address.address_line2 || '');
    setCity(address.city);
    setState(address.state);
    setPostalCode(address.postal_code);
    setCountry(address.country);
    setIsDefault(address.is_default);
    setEditingAddressId(address.id);
    setShowAddForm(true);
  };
  
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);
        
      if (error) throw error;
      
      setAddresses(addresses.filter(addr => addr.id !== addressId));
      toast.success('Address deleted successfully');
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };
  
  const handleSetDefault = async (addressId: string) => {
    try {
      // First, set all addresses to non-default
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user?.id);
      
      // Then set the selected address as default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId);
        
      if (error) throw error;
      
      // Update local state
      setAddresses(addresses.map(addr => ({
        ...addr,
        is_default: addr.id === addressId
      })));
      
      toast.success('Default address updated');
    } catch (error) {
      console.error('Error setting default address:', error);
      toast.error('Failed to update default address');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // If this is set as default and we have other addresses, update those first
      if (isDefault && addresses.length > 0) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user?.id);
      }
      
      // If no addresses yet and this is the first one, make it default regardless
      const firstAddress = addresses.length === 0;
      
      if (editingAddressId) {
        // Update existing address
        const { error, data } = await supabase
          .from('addresses')
          .update({
            address_line1: addressLine1,
            address_line2: addressLine2 || null,
            city,
            state,
            postal_code: postalCode,
            country,
            is_default: isDefault || firstAddress
          })
          .eq('id', editingAddressId)
          .select();
          
        if (error) throw error;
        
        setAddresses(addresses.map(addr => 
          addr.id === editingAddressId ? data[0] : addr
        ));
        
        toast.success('Address updated successfully');
      } else {
        // Create new address
        const { error, data } = await supabase
          .from('addresses')
          .insert({
            user_id: user?.id,
            address_line1: addressLine1,
            address_line2: addressLine2 || null,
            city,
            state,
            postal_code: postalCode,
            country,
            is_default: isDefault || firstAddress
          })
          .select();
          
        if (error) throw error;
        
        setAddresses([...addresses, data[0]]);
        toast.success('Address added successfully');
      }
      
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-16 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-playfair font-bold text-naaz-green mb-10">Manage Addresses</h1>
          
          <div className="grid md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <UserMenu activeItem="settings" />
            </div>
            
            {/* Content Area */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-naaz-green">Shipping Addresses</h2>
                  {!showAddForm && (
                    <Button onClick={handleAddAddress} className="flex items-center">
                      <Plus size={16} className="mr-2" />
                      Add New Address
                    </Button>
                  )}
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-naaz-green"></div>
                  </div>
                ) : (
                  <>
                    {showAddForm ? (
                      <div className="bg-gray-50 p-6 rounded-lg mb-6">
                        <h3 className="text-lg font-medium text-naaz-green mb-4">
                          {editingAddressId ? 'Edit Address' : 'Add New Address'}
                        </h3>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                            <label htmlFor="addressLine1" className="block text-gray-700 mb-1">Address Line 1 *</label>
                            <Input 
                              id="addressLine1" 
                              value={addressLine1}
                              onChange={(e) => setAddressLine1(e.target.value)}
                              placeholder="Street address, P.O. box, company name"
                              required
                              disabled={isSubmitting}
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="addressLine2" className="block text-gray-700 mb-1">Address Line 2</label>
                            <Input 
                              id="addressLine2" 
                              value={addressLine2}
                              onChange={(e) => setAddressLine2(e.target.value)}
                              placeholder="Apartment, suite, unit, building, floor, etc."
                              disabled={isSubmitting}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="city" className="block text-gray-700 mb-1">City *</label>
                              <Input 
                                id="city" 
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                                disabled={isSubmitting}
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="state" className="block text-gray-700 mb-1">State *</label>
                              <Input 
                                id="state" 
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                required
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="postalCode" className="block text-gray-700 mb-1">Postal Code *</label>
                              <Input 
                                id="postalCode" 
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                required
                                disabled={isSubmitting}
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="country" className="block text-gray-700 mb-1">Country *</label>
                              <Input 
                                id="country" 
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                required
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center">
                            <input 
                              type="checkbox" 
                              id="isDefault" 
                              checked={isDefault}
                              onChange={(e) => setIsDefault(e.target.checked)}
                              className="h-4 w-4 text-naaz-gold focus:ring-naaz-green"
                              disabled={isSubmitting}
                            />
                            <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                              Set as default shipping address
                            </label>
                          </div>
                          
                          <div className="flex space-x-4 pt-2">
                            <Button 
                              type="submit" 
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                'Save Address'
                              )}
                            </Button>
                            
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => {
                                resetForm();
                                setShowAddForm(false);
                              }}
                              disabled={isSubmitting}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </div>
                    ) : null}
                    
                    {addresses.length > 0 ? (
                      <div className="space-y-4">
                        {addresses.map((address) => (
                          <div 
                            key={address.id} 
                            className={`border rounded-lg p-4 ${address.is_default ? 'border-naaz-gold bg-naaz-cream/30' : 'border-gray-200'}`}
                          >
                            {address.is_default && (
                              <div className="text-naaz-gold text-xs font-medium mb-2 flex items-center">
                                <Check size={12} className="mr-1" />
                                DEFAULT ADDRESS
                              </div>
                            )}
                            
                            <div className="mb-2">
                              <p className="text-gray-800">{address.address_line1}</p>
                              {address.address_line2 && <p className="text-gray-800">{address.address_line2}</p>}
                              <p className="text-gray-800">{address.city}, {address.state} {address.postal_code}</p>
                              <p className="text-gray-800">{address.country}</p>
                            </div>
                            
                            <div className="flex space-x-4 mt-4">
                              <button 
                                onClick={() => handleEditAddress(address)}
                                className="text-naaz-green hover:text-naaz-gold flex items-center text-sm"
                              >
                                <Edit size={14} className="mr-1" />
                                Edit
                              </button>
                              
                              <button 
                                onClick={() => handleDeleteAddress(address.id)}
                                className="text-red-600 hover:text-red-800 flex items-center text-sm"
                              >
                                <Trash2 size={14} className="mr-1" />
                                Delete
                              </button>
                              
                              {!address.is_default && (
                                <button 
                                  onClick={() => handleSetDefault(address.id)}
                                  className="text-naaz-gold hover:text-naaz-green flex items-center text-sm"
                                >
                                  <Check size={14} className="mr-1" />
                                  Set as Default
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-8 text-center rounded-lg">
                        <p className="text-gray-500 mb-4">You haven't added any addresses yet.</p>
                        {!showAddForm && (
                          <Button onClick={handleAddAddress}>
                            <Plus size={16} className="mr-2" />
                            Add Your First Address
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddressManagement;
