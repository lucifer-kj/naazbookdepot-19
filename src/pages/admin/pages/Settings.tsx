import React from 'react';

const Settings: React.FC = () => (
  <div>
    <h1 className="text-2xl font-playfair font-bold text-naaz-green mb-8">Settings</h1>
    <div className="bg-white rounded-lg shadow p-8">
      <h2 className="text-lg font-semibold mb-4">Store Settings</h2>
      <form className="space-y-6 max-w-lg">
        <div>
          <label className="block text-gray-700 mb-1">Store Name</label>
          <input className="border border-gray-300 rounded px-4 py-2 w-full" defaultValue="Naaz Book Depot" />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Contact Email</label>
          <input className="border border-gray-300 rounded px-4 py-2 w-full" defaultValue="info@naazbookdepot.com" />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Support Phone</label>
          <input className="border border-gray-300 rounded px-4 py-2 w-full" defaultValue="+91 98765 43210" />
        </div>
        <button type="submit" className="bg-naaz-green text-white px-6 py-2 rounded hover:bg-naaz-green/90">
          Save Changes
        </button>
      </form>
    </div>
  </div>
);

export default Settings;
