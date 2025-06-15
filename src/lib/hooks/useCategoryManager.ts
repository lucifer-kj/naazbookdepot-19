
import { useState, useMemo } from 'react';
import { useAllCategories, Category } from './useCategories';

export interface CategoryOption {
  id: string;
  name: string;
  level: number;
  isParent: boolean;
  parentId: string | null;
}

export const useCategoryManager = () => {
  const { data: categories, isLoading, error } = useAllCategories();
  const [searchQuery, setSearchQuery] = useState('');

  const flattenedCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];

    console.log('Raw categories data:', categories);

    // Build hierarchy with proper levels
    const buildHierarchy = (parentId: string | null = null, level = 0): CategoryOption[] => {
      const result: CategoryOption[] = [];
      
      const childCategories = categories.filter(cat => cat.parent_id === parentId);
      
      childCategories.forEach(category => {
        const hasChildren = categories.some(cat => cat.parent_id === category.id);
        
        const categoryOption: CategoryOption = {
          id: category.id,
          name: category.name,
          level,
          isParent: hasChildren,
          parentId: category.parent_id
        };
        
        result.push(categoryOption);

        // Recursively add child categories
        if (hasChildren) {
          result.push(...buildHierarchy(category.id, level + 1));
        }
      });

      return result;
    };

    const hierarchy = buildHierarchy();
    console.log('Built hierarchy:', hierarchy);
    return hierarchy;
  }, [categories]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return flattenedCategories;
    
    return flattenedCategories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [flattenedCategories, searchQuery]);

  const selectableCategories = useMemo(() => {
    // Return all categories for selection
    return filteredCategories;
  }, [filteredCategories]);

  const getCategoryById = (id: string): CategoryOption | undefined => {
    return flattenedCategories.find(cat => cat.id === id);
  };

  const getCategoryPath = (categoryId: string): string => {
    const category = getCategoryById(categoryId);
    if (!category) return '';

    const buildPath = (catId: string): string[] => {
      const cat = getCategoryById(catId);
      if (!cat) return [];
      
      if (cat.parentId) {
        return [...buildPath(cat.parentId), cat.name];
      }
      return [cat.name];
    };

    return buildPath(categoryId).join(' > ');
  };

  return {
    categories: flattenedCategories,
    filteredCategories,
    selectableCategories,
    searchQuery,
    setSearchQuery,
    isLoading,
    error,
    getCategoryById,
    getCategoryPath
  };
};
