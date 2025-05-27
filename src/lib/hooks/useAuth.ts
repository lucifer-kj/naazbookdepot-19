
import { useContext } from 'react';
import { useAuth as useAuthContext } from '@/lib/context/AuthContext';

export const useAuth = () => {
  return useAuthContext();
};
