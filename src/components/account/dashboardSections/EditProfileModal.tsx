import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { AppUser } from '@/lib/context/AuthContext'; // Assuming AppUser is exported
import type { Profile } from '@/lib/context/AuthContext'; // Assuming Profile is exported or define locally

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
        phone: user.phone || user.user_metadata?.phone || '', // Supabase user object has phone directly
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

    // Construct the data to update. Only include fields that are being managed by this form.
    const profileDataToUpdate: Partial<Profile> = {
      full_name: profileFormData.full_name,
      // phone: profileFormData.phone, // Assuming phone is part of the 'profiles' table or user_metadata
    };

    // If phone is intended to be updated on the Supabase Auth user.phone field
    // it needs to be handled via supabase.auth.updateUser({ phone: profileFormData.phone })
    // For this example, we are assuming `updateProfile` primarily targets a `profiles` table linked by user.id
    // and `full_name` might also be in `user_metadata`. The `AuthContext` `updateProfile` handles this logic.

    const result = await updateProfile(profileDataToUpdate);

    if (result.success) {
      toast.success('Profile updated successfully!');
      onClose(); // Close modal on success
    } else {
      toast.error(`Error updating profile: ${result.error?.message || 'Unknown error'}`);
    }
    setIsUpdatingProfile(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-playfair text-naaz-green">Edit Your Profile</DialogTitle>
        </DialogHeader>
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
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isUpdatingProfile}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isUpdatingProfile || isAuthLoading}>
              {isUpdatingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
