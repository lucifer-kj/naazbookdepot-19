import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

const AddEditProduct: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-naaz-green mb-6">Add / Edit Product</h1>
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input className="w-full border rounded-lg px-3 py-2" type="text" placeholder="Product Name" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea className="w-full border rounded-lg px-3 py-2" placeholder="Description" rows={3}></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select className="w-full border rounded-lg px-3 py-2">
            <option>Quran & Tafsir</option>
            <option>Hadith</option>
            <option>Fiqh</option>
          </select>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Price</label>
            <input className="w-full border rounded-lg px-3 py-2" type="number" placeholder="Price" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">SKU</label>
            <input className="w-full border rounded-lg px-3 py-2" type="text" placeholder="SKU" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <input className="w-full border rounded-lg px-3 py-2" type="text" placeholder="Comma separated tags" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Upload Images</label>
          <input className="w-full" type="file" multiple onChange={e => setImages(Array.from(e.target.files || []))} />
          <div className="flex gap-2 mt-2 flex-wrap">
            {images.map((img, idx) => (
              <span key={idx} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs">{img.name}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input className="w-full border rounded-lg px-3 py-2" type="number" placeholder="Quantity" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Restock Alert</label>
            <input className="w-full border rounded-lg px-3 py-2" type="number" placeholder="Restock Alert" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select className="w-full border rounded-lg px-3 py-2">
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        <Button className="w-full bg-naaz-green text-white">Save Product</Button>
      </form>
    </div>
  );
};

export default AddEditProduct;
