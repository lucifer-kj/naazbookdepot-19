
import { useState, useCallback } from 'react';
import type { Address } from '@/lib/types/auth';

export const useAddressManagement = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);

  const addAddress = useCallback((address: Omit<Address, 'id'>) => {
    const newAddress: Address = {
      ...address,
      id: Date.now().toString()
    };
    setAddresses(prev => [...prev, newAddress]);
  }, []);

  const updateAddress = useCallback((id: string, addressData: Partial<Address>) => {
    setAddresses(prev => 
      prev.map(addr => addr.id === id ? { ...addr, ...addressData } : addr)
    );
  }, []);

  const deleteAddress = useCallback((id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  }, []);

  return {
    addresses,
    addAddress,
    updateAddress,
    deleteAddress
  };
};
