import React, { useState, useEffect } from 'react';
import { useFetchStoreSettings, useUpdateStoreSettings, StoreSettings } from '@/lib/hooks/useStoreSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const { data: settings, isLoading: isLoadingSettings, error: fetchError } = useFetchStoreSettings();
  const updateSettingsMutation = useUpdateStoreSettings();

  const [formData, setFormData] = useState<Partial<Omit<StoreSettings, 'id' | 'updated_at'>>>({
    store_name: '',
    contact_email: '',
    support_phone: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        store_name: settings.store_name || '',
        contact_email: settings.contact_email || '',
        support_phone: settings.support_phone || '',
      });
    }
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettingsMutation.mutateAsync(formData);
      toast.success('Store settings updated successfully!');
    } catch (err: any) {
      toast.error(`Failed to update settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-naaz-green" />
        <p className="ml-2 text-lg">Loading settings...</p>
      </div>
    );
  }

  if (fetchError) {
    // A toast might have already been shown by a global error handler or if the hook does it.
    // This is an additional inline error display.
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Fetching Settings</h2>
        <p className="text-center max-w-md">{fetchError.message || 'An unexpected error occurred.'}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-playfair font-bold text-naaz-green mb-8">Store Settings</h1>
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-xl font-semibold text-naaz-green mb-6">General Information</h2>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
          <div>
            <Label htmlFor="store_name" className="block text-gray-700 mb-1">Store Name</Label>
            <Input
              id="store_name"
              name="store_name"
              value={formData.store_name || ''}
              onChange={handleInputChange}
              className="border-gray-300"
              placeholder="e.g., Naaz Book Depot"
            />
          </div>
          <div>
            <Label htmlFor="contact_email" className="block text-gray-700 mb-1">Contact Email</Label>
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              value={formData.contact_email || ''}
              onChange={handleInputChange}
              className="border-gray-300"
              placeholder="e.g., info@example.com"
            />
          </div>
          <div>
            <Label htmlFor="support_phone" className="block text-gray-700 mb-1">Support Phone</Label>
            <Input
              id="support_phone"
              name="support_phone"
              value={formData.support_phone || ''}
              onChange={handleInputChange}
              className="border-gray-300"
              placeholder="e.g., +91 12345 67890"
            />
          </div>
          {/* Add more settings fields here as needed */}
          <Button
            type="submit"
            className="bg-naaz-green text-white hover:bg-naaz-green/90 px-8 py-2 min-w-[150px]"
            disabled={isSaving || updateSettingsMutation.isPending}
          >
            {isSaving || updateSettingsMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
