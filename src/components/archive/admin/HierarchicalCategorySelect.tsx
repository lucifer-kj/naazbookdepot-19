// Archived from src/components/admin/HierarchicalCategorySelect.tsx
// This component provides a simpler category select with hierarchical display.
// Consider using this approach for bulk operations or category management where
// a full tree view is more useful than a searchable flat list.

import React from 'react';
import { Category } from '@/lib/hooks/useCategories';

interface HierarchicalCategorySelectProps {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
  placeholder?: string;
  className?: string;
}

const HierarchicalCategorySelect: React.FC<HierarchicalCategorySelectProps> = ({
  categories,
  value,
  onChange,
  placeholder = "Select Category",
  className = ""
}) => {
  const renderOptions = (cats: Category[], level = 0) => {
    return cats.map(category => (
      <React.Fragment key={category.id}>
        <option value={category.id}>
          {'—'.repeat(level)} {category.name}
        </option>
        {category.subcategories && category.subcategories.length > 0 && 
          renderOptions(category.subcategories, level + 1)
        }
      </React.Fragment>
    ));
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-naaz-green ${className}`}
      required
    >
      <option value="">{placeholder}</option>
      {renderOptions(categories)}
    </select>
  );
};

export default HierarchicalCategorySelect;