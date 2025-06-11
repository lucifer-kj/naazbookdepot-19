import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { TablesInsert } from '@/integrations/supabase/types';

// Define a more specific type for the productData prop for this section
// This helps in making the component more self-contained and easier to understand.
type BookDetailsData = Pick<
  TablesInsert<'products'>,
  'author' | 'isbn' | 'publisher' | 'publication_year' | 'language' | 'page_count' | 'dimensions' | 'weight'
>;

interface BookDetailsFormSectionProps {
  productData: Partial<BookDetailsData>; // Use Partial if not all fields are mandatory at all times
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  errors: Record<string, string>;
}

const BookDetailsFormSection: React.FC<BookDetailsFormSectionProps> = ({
  productData,
  handleInputChange,
  errors,
}) => {
  return (
    <fieldset className="border p-4 rounded-lg">
      <legend className="text-lg font-medium text-naaz-green px-2">Book Details</legend>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div>
          <Label htmlFor="author" className="block text-sm font-medium mb-1">Author</Label>
          <Input
            id="author"
            name="author"
            value={productData.author || ''}
            onChange={handleInputChange}
            placeholder="Author Name"
            className="w-full border rounded-lg px-3 py-2"
          />
          {/* errors.author should be handled by parent or passed if specific validation exists here */}
        </div>
        <div>
          <Label htmlFor="isbn" className="block text-sm font-medium mb-1">ISBN</Label>
          <Input
            id="isbn"
            name="isbn"
            value={productData.isbn || ''}
            onChange={handleInputChange}
            placeholder="978-xxxxxxxxxx"
            className="w-full border rounded-lg px-3 py-2"
          />
          {errors.isbn && <p className="text-sm text-red-500 mt-1">{errors.isbn}</p>}
        </div>
        <div>
          <Label htmlFor="publisher" className="block text-sm font-medium mb-1">Publisher</Label>
          <Input
            id="publisher"
            name="publisher"
            value={productData.publisher || ''}
            onChange={handleInputChange}
            placeholder="Publisher Name"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <Label htmlFor="publication_year" className="block text-sm font-medium mb-1">Publication Year</Label>
          <Input
            id="publication_year"
            name="publication_year"
            type="number"
            value={productData.publication_year || ''}
            onChange={handleInputChange}
            placeholder="YYYY"
            min="1000"
            max={new Date().getFullYear() + 5}
            className="w-full border rounded-lg px-3 py-2"
          />
          {errors.publication_year && <p className="text-sm text-red-500 mt-1">{errors.publication_year}</p>}
        </div>
        <div>
          <Label htmlFor="language" className="block text-sm font-medium mb-1">Language</Label>
          <Input
            id="language"
            name="language"
            value={productData.language || 'English'}
            onChange={handleInputChange}
            placeholder="e.g., English, Arabic"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <Label htmlFor="page_count" className="block text-sm font-medium mb-1">Page Count</Label>
          <Input
            id="page_count"
            name="page_count"
            type="number"
            value={productData.page_count || ''}
            onChange={handleInputChange}
            placeholder="Number of pages"
            min="1"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <Label htmlFor="dimensions" className="block text-sm font-medium mb-1">Dimensions (cm)</Label>
          <Input
            id="dimensions"
            name="dimensions"
            value={productData.dimensions || ''}
            onChange={handleInputChange}
            placeholder="e.g., 15 x 22 x 3"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <Label htmlFor="weight" className="block text-sm font-medium mb-1">Weight (grams)</Label>
          <Input
            id="weight"
            name="weight"
            type="number"
            value={productData.weight || ''}
            onChange={handleInputChange}
            placeholder="e.g., 500"
            min="1"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
      </div>
    </fieldset>
  );
};

export default BookDetailsFormSection;
