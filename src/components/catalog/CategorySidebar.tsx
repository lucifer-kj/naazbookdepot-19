
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
  subcategories?: Category[];
}

interface CategorySidebarProps {
  categories: Category[];
  activeCategory?: string;
  onCategorySelect: (categorySlug: string) => void;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({ 
  categories, 
  activeCategory, 
  onCategorySelect 
}) => {
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const renderCategory = (category: Category, level = 0) => {
    const isExpanded = expandedCategories.includes(category.id);
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    const isActive = activeCategory === category.slug;

    return (
      <div key={category.id} className={`ml-${level * 4}`}>
        <div 
          className={`flex items-center justify-between p-2 hover:bg-naaz-cream/50 rounded cursor-pointer ${
            isActive ? 'bg-naaz-green/10 text-naaz-green font-medium' : ''
          }`}
          onClick={() => onCategorySelect(category.slug)}
        >
          <span className="flex-1">{category.name}</span>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">({category.count})</span>
            {hasSubcategories && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategory(category.id);
                }}
                className="p-1"
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
          </div>
        </div>
        {hasSubcategories && isExpanded && (
          <div className="ml-4">
            {category.subcategories!.map(subcategory => 
              renderCategory(subcategory, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-playfair font-semibold text-naaz-green mb-4">
        Categories
      </h3>
      <div className="space-y-1">
        {categories.map(category => renderCategory(category))}
      </div>
    </div>
  );
};

export default CategorySidebar;
