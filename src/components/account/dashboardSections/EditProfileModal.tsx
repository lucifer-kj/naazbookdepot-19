import React, { useState, useEffect } from 'react';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/lable';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { AppUser } from '@/lib/context/AuthContext';
export type Profile = {
  full_name?: string;
  phone?: string;
  // ...add other fields as needed
};

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AppUser | null; // User can be null if AuthContext hasn't loaded it yet or if logged out
  updateProfile: (profileData: Partial<Profile>) => Promise<{ success: boolean; error?: any }>;
  isAuthLoading: boolean; // For disabling form during other auth operations
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  updateProfile,
  isAuthLoading,
}) => {
  const [profileFormData, setProfileFormData] = useState({ full_name: '', phone: '' });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setProfileFormData({
        full_name: user.profile?.full_name || user.user_metadata?.full_name || '',
        phone: user.profile?.phone || user.user_metadata?.phone || user.phone || '',
      });
    }
  }, [user, isOpen]);

  const handleProfileFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to update your profile.");
      return;
    }
    setIsUpdatingProfile(true);

    const profileDataToUpdate: Partial<Profile> = {
      full_name: profileFormData.full_name,
      phone: profileFormData.phone,
    };

    const result = await updateProfile(profileDataToUpdate);

    if (result.success) {
      toast.success('Profile updated successfully!');
      onClose();
    } else {
      toast.error(`Error updating profile: ${result.error?.message || 'Unknown error'}`);
    }
    setIsUpdatingProfile(false);
  };

  return (
    // TODO: Replace with a real modal/dialog implementation
    isOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <div className="mb-4">
            <h2 className="font-playfair text-naaz-green text-xl font-bold">Edit Your Profile</h2>
          </div>
          <form onSubmit={handleProfileUpdate} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={profileFormData.full_name}
                onChange={handleProfileFormChange}
                className="mt-1"
                placeholder="Your full name"
                disabled={isUpdatingProfile || isAuthLoading}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={profileFormData.phone}
                onChange={handleProfileFormChange}
                className="mt-1"
                placeholder="Your phone number (e.g., +91...)"
                disabled={isUpdatingProfile || isAuthLoading}
              />
            </div>
            {/* Add other profile fields here if needed */}
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" disabled={isUpdatingProfile} onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdatingProfile || isAuthLoading}>
                {isUpdatingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    ) : null
  );
};

export default EditProfileModal;
