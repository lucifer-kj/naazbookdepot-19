
import { fetchStrapi } from '../strapi-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface StrapiUserProfile {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  addresses?: StrapiUserAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface StrapiUserAddress {
  id: string;
  type: 'billing' | 'shipping';
  default: boolean;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

// Fetch the current user's profile
export async function fetchUserProfile() {
  try {
    return fetchStrapi<StrapiUserProfile>('/users/me?populate=addresses');
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

// Update user profile
export async function updateUserProfile(profileData: Partial<StrapiUserProfile>) {
  try {
    return fetchStrapi<StrapiUserProfile>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Add a new address
export async function addUserAddress(addressData: Omit<StrapiUserAddress, 'id'>) {
  try {
    return fetchStrapi<StrapiUserAddress>('/user-addresses', {
      method: 'POST',
      body: JSON.stringify({ data: addressData }),
    });
  } catch (error) {
    console.error('Error adding address:', error);
    throw error;
  }
}

// Update existing address
export async function updateUserAddress(id: string, addressData: Partial<StrapiUserAddress>) {
  try {
    return fetchStrapi<StrapiUserAddress>(`/user-addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ data: addressData }),
    });
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
}

// Delete address
export async function deleteUserAddress(id: string) {
  try {
    return fetchStrapi(`/user-addresses/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
}

// Set address as default
export async function setDefaultAddress(id: string, type: 'billing' | 'shipping') {
  try {
    return fetchStrapi<StrapiUserAddress>(`/user-addresses/${id}/set-default`, {
      method: 'PUT',
      body: JSON.stringify({ type }),
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    throw error;
  }
}

// React Query hooks for user profile
export function useUserProfile() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: fetchUserProfile,
  });
}

// Mutation hooks for user operations
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
    onError: (error: any) => {
      toast.error(`Error updating profile: ${error.message}`);
    },
  });
}

export function useAddUserAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addUserAddress,
    onSuccess: (data) => {
      toast.success('Address added successfully');
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
    onError: (error: any) => {
      toast.error(`Error adding address: ${error.message}`);
    },
  });
}

export function useUpdateUserAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StrapiUserAddress> }) => 
      updateUserAddress(id, data),
    onSuccess: (data) => {
      toast.success('Address updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
    onError: (error: any) => {
      toast.error(`Error updating address: ${error.message}`);
    },
  });
}

export function useDeleteUserAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUserAddress,
    onSuccess: () => {
      toast.success('Address deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
    onError: (error: any) => {
      toast.error(`Error deleting address: ${error.message}`);
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: 'billing' | 'shipping' }) => 
      setDefaultAddress(id, type),
    onSuccess: () => {
      toast.success('Default address updated');
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
    onError: (error: any) => {
      toast.error(`Error updating default address: ${error.message}`);
    },
  });
}
