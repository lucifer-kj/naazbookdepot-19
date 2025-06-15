
import { useState, useMemo } from 'react';
import { useCategories, Category } from './useCategories';

export interface CategoryOption {
  id: string;
  name: string;
  level: number;
  isParent: boolean;
  parentId: string | null;
}

export const useCategoryManager = () => {
  const { data: categories, isLoading, error } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');

  const flattenedCategories = useMemo(() => {
    if (!categories) return [];

    const flattenCategories = (cats: Category[], level = 0): CategoryOption[] => {
      const result: CategoryOption[] = [];
      
      cats.forEach(category => {
        const hasSubcategories = category.subcategories && category.subcategories.length > 0;
        
        result.push({
          id: category.id,
          name: category.name,
          level,
          isParent: hasSubcategories,
          parentId: category.parent_id || null
        });

        if (hasSubcategories) {
          result.push(...flattenCategories(category.subcategories, level + 1));
        }
      });

      return result;
    };

    return flattenCategories(categories);
  }, [categories]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return flattenedCategories;
    
    return flattenedCategories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [flattenedCategories, searchQuery]);

  const selectableCategories = useMemo(() => {
    // Allow selection of all categories (both parent and child categories)
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
