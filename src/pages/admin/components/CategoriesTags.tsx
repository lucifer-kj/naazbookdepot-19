import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCategories, useAddCategory, useDeleteCategory, Category } from '@/lib/hooks/useCategories';
import { Loader2, AlertTriangle, Trash2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

// Helper to generate slug
const generateSlug = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
};

const CategoriesTags: React.FC = () => {
  const { data: categories, isLoading, error: fetchError } = useCategories(); // Assuming fetching for 'islamic-books' or all
  const addCategoryMutation = useAddCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySlug, setNewCategorySlug] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');


  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Category name cannot be empty.');
      return;
    }
    const slug = newCategorySlug.trim() || generateSlug(newCategoryName);

    try {
      await addCategoryMutation.mutateAsync({
        name: newCategoryName,
        slug: slug,
        description: newCategoryDescription,
        is_active: true, // Default to active
        shop_type: 'islamic-books', // Or make this dynamic if needed
        sort_order: 0, // Default sort_order
        // parent_id: null, // Or allow selecting a parent
      });
      toast.success(`Category "${newCategoryName}" added successfully.`);
      setNewCategoryName('');
      setNewCategorySlug('');
      setNewCategoryDescription('');
    } catch (err: any) {
      toast.error(`Failed to add category: ${err.message}`);
    }
  };

  const handleDeleteCategory = (categoryId: string, categoryName: string) => {
    if (window.confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      deleteCategoryMutation.mutate(categoryId, {
        onSuccess: () => {
          toast.success(`Category "${categoryName}" deleted successfully.`);
        },
        onError: (err: any) => {
          toast.error(`Failed to delete category: ${err.message}`);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-naaz-green" />
        <p className="ml-2 text-lg">Loading categories...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Fetching Categories</h2>
        <p className="text-center max-w-md">{fetchError.message || 'An unexpected error occurred.'}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-naaz-green mb-8 text-center">Manage Categories</h1>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8 space-y-4">
        <h2 className="text-xl font-semibold text-naaz-green mb-3">Add New Category</h2>
        <div>
          <label htmlFor="newCategoryName" className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
          <Input
            id="newCategoryName"
            type="text"
            placeholder="Category Name"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label htmlFor="newCategorySlug" className="block text-sm font-medium text-gray-700 mb-1">Slug (Optional)</label>
          <Input
            id="newCategorySlug"
            type="text"
            placeholder="category-slug (auto-generated if blank)"
            value={newCategorySlug}
            onChange={e => setNewCategorySlug(e.target.value)}
            className="w-full"
          />
           <p className="text-xs text-gray-500 mt-1">If left blank, slug will be generated from the name.</p>
        </div>
         <div>
          <label htmlFor="newCategoryDescription" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
          <Input
            id="newCategoryDescription"
            type="text"
            placeholder="Brief description of the category"
            value={newCategoryDescription}
            onChange={e => setNewCategoryDescription(e.target.value)}
            className="w-full"
          />
        </div>
        <Button
          className="bg-naaz-green text-white hover:bg-naaz-green/90 w-full sm:w-auto"
          type="button"
          onClick={handleAddCategory}
          disabled={addCategoryMutation.isPending}
        >
          {addCategoryMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
          Add Category
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-naaz-green mb-4">Existing Categories</h2>
        {categories && categories.length > 0 ? (
          <ul className="space-y-3">
            {categories.map((cat: Category) => (
              <li
                key={cat.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                <div>
                  <span className="font-medium text-gray-800">{cat.name}</span>
                  {cat.slug && <span className="ml-2 text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{cat.slug}</span>}
                  {cat.description && <p className="text-xs text-gray-600 mt-1">{cat.description}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-100"
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  disabled={deleteCategoryMutation.isPending && deleteCategoryMutation.variables === cat.id}
                >
                  {deleteCategoryMutation.isPending && deleteCategoryMutation.variables === cat.id
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Trash2 className="h-4 w-4" />}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-4">No categories found. Add some above!</p>
        )}
      </div>
    </div>
  );
};

export default CategoriesTags;
