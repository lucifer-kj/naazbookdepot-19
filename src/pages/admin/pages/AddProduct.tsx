import React from 'react';

const AddProduct: React.FC = () => {
  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add New Product</h2>
      <form>
        <div className="mb-3">
          <label className="block mb-1 font-medium">Product Name</label>
          <input className="w-full border rounded px-3 py-2" type="text" placeholder="Enter product name" />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium">Price</label>
          <input className="w-full border rounded px-3 py-2" type="number" placeholder="Enter price" />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium">Description</label>
          <textarea className="w-full border rounded px-3 py-2" placeholder="Enter description" />
        </div>
        <button type="submit" className="bg-naaz-green text-white px-4 py-2 rounded">Add Product</button>
      </form>
    </div>
  );
};

export default AddProduct;
