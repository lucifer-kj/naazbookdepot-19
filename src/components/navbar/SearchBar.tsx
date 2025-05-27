
import React, { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = () => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <div className={`hidden md:flex items-center bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 ${isSearchExpanded ? 'w-80' : 'w-64'}`}>
      <Search className="text-gray-400 ml-3" size={18} />
      <input
        type="text"
        placeholder="Search for Islamic books, knowledge..."
        className="flex-1 outline-none text-sm py-3 px-3"
        onFocus={() => setIsSearchExpanded(true)}
        onBlur={() => setIsSearchExpanded(false)}
      />
    </div>
  );
};

export default SearchBar;
