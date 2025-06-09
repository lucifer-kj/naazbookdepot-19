import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const mockCategories = [
  { id: 1, name: 'Quran & Tafsir', color: 'bg-naaz-green' },
  { id: 2, name: 'Hadith', color: 'bg-naaz-gold' },
  { id: 3, name: 'Fiqh', color: 'bg-blue-500' },
];

const CategoriesTags: React.FC = () => {
  const [categories, setCategories] = useState(mockCategories);
  const [newCategory, setNewCategory] = useState('');
  const [color, setColor] = useState('bg-naaz-green');

  const handleAdd = () => {
    if (newCategory.trim()) {
      setCategories([...categories, { id: Date.now(), name: newCategory, color }]);
      setNewCategory('');
    }
  };

  const handleDelete = (id: number) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-naaz-green mb-6">Categories & Tags</h1>
      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 border rounded-lg px-3 py-2"
          type="text"
          placeholder="New Category"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
        />
        <select className="border rounded-lg px-2 py-2" value={color} onChange={e => setColor(e.target.value)}>
          <option value="bg-naaz-green">Green</option>
          <option value="bg-naaz-gold">Gold</option>
          <option value="bg-blue-500">Blue</option>
        </select>
        <Button className="bg-naaz-green text-white" type="button" onClick={handleAdd}>Add</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <span key={cat.id} className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white ${cat.color}`}>
            {cat.name}
            <button type="button" className="ml-1 text-xs" onClick={() => handleDelete(cat.id)}>&times;</button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default CategoriesTags;
