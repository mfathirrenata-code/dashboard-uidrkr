import React, { useState } from 'react';
import { Search } from 'lucide-react';

export const SearchBar = ({ searchTerm, onSearchChange }) => {
  // Logika state tetap dipertahankan
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-2.5 rounded-full transition-all duration-300
        ${focused ? 'bg-white ring-1 ring-slate-200 shadow-sm' : 'bg-slate-50 hover:bg-slate-100/80'}
      `}
    >
      <Search 
        className={`
          w-4 h-4 shrink-0 transition-colors duration-300
          ${focused ? 'text-cyan-500' : 'text-slate-400'}
        `} 
      />
      <input
        type="text"
        placeholder="Cari data..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
      />
    </div>
  );
};