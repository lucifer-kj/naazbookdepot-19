import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, XCircle } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

interface ProductImageManagementProps {
  existingImages: Tables<'product_images'>[];
  newImages: File[]; // Though not directly used in this component's JSX, it's often relevant for parent logic
  imagePreviews: string[];
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveNewImage: (index: number) => void;
  onRemoveExistingImage: (imageId: number, imageUrl: string) => Promise<void>;
  // isSaving?: boolean; // Optional: if parts of this form should be disabled during save
}

const ProductImageManagement: React.FC<ProductImageManagementProps> = ({
  existingImages,
  imagePreviews,
  onImageChange,
  onRemoveNewImage,
  onRemoveExistingImage,
}) => {
  return (
    <div>
      <Label className="block text-sm font-medium mb-2">Product Images</Label>
      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-600 mb-2">Current Images:</h4>
          <div className="flex flex-wrap gap-3">
            {existingImages.map((img) => (
              <div key={img.id} className="relative group">
                <img
                  src={img.image_url}
                  alt="Existing product"
                  className="w-24 h-24 object-cover rounded-md border border-gray-300"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemoveExistingImage(img.id, img.image_url)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Image Upload */}
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <Label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-white rounded-md font-medium text-naaz-green hover:text-naaz-green-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-naaz-green-light"
            >
              <span>Upload files</span>
              <Input
                id="file-upload"
                name="file-upload"
                type="file"
                multiple
                onChange={onImageChange}
                className="sr-only"
                accept="image/*"
              />
            </Label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
        </div>
      </div>

      {/* New Image Previews */}
      {imagePreviews.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-semibold text-gray-600 mb-2">New Images Preview:</h4>
          <div className="flex flex-wrap gap-3">
            {imagePreviews.map((previewUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={previewUrl}
                  alt={`New preview ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-md border border-gray-300"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onRemoveNewImage(index)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageManagement;
