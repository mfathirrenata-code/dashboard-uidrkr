import React, { useState } from 'react';

export default function TableFilter({ 
  columnName, 
  uniqueValues, 
  selectedFilters, 
  onFilterChange,
  isOpen,       // <--- TAMBAHAN PROPS BARU
  onToggle      // <--- TAMBAHAN PROPS BARU
}) {
  // HAPUS BARIS INI: const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onFilterChange(uniqueValues);
    } else {
      onFilterChange([]);
    }
  };

  const handleToggleFilter = (val) => {
    const newFilters = selectedFilters.includes(val)
      ? selectedFilters.filter(item => item !== val)
      : [...selectedFilters, val];
    onFilterChange(newFilters);
  };

  const handleSelectOnly = (e, val) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    onFilterChange([val]);
  };

  const formattedColumnName = columnName.replace(/_/g, ' ').toUpperCase();

  return (
    <div className="relative">
      {/* Overlay background */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={onToggle} // <--- UBAH JADI onToggle
        ></div>
      )}
      
      <button 
        onClick={onToggle} // <--- UBAH JADI onToggle
        className={`relative z-50 flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-bold transition-colors ${
          isOpen ? 'bg-[#F8FAFC] border-[#00A2E9] text-[#00A2E9]' : 'border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] bg-white'
        }`}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filter {formattedColumnName}
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#E2E8F0] z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={selectedFilters.length === uniqueValues.length && uniqueValues.length > 0} 
                onChange={handleSelectAll}
                className="w-4 h-4 rounded text-[#00A2E9] focus:ring-[#00A2E9] cursor-pointer"
              />
              <span className="font-bold text-[#0F172A] text-sm uppercase tracking-wider">Pilih Semua Unit</span>
            </label>
          </div>
          
          <div className="p-3 border-b border-[#E2E8F0]">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Ketik untuk menelusuri..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-[#E2E8F0] focus:bg-white focus:border-[#00A2E9] focus:ring-1 focus:ring-[#00A2E9] rounded-lg outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200">
            {uniqueValues
              .filter(val => val.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(val => (
                <label key={val} className="flex items-center justify-between p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group relative">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes(val)}
                      onChange={() => handleToggleFilter(val)}
                      className="w-4 h-4 rounded border-slate-300 text-[#00A2E9] focus:ring-[#00A2E9] cursor-pointer flex-shrink-0"
                    />
                    <span className="text-sm font-medium text-[#475569] group-hover:text-[#0F172A] truncate">
                      {val}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleSelectOnly(e, val)}
                    className="opacity-0 group-hover:opacity-100 absolute right-2 text-[11px] font-bold text-[#00A2E9] hover:text-blue-700 bg-blue-50 px-2 py-1 rounded transition-opacity"
                  >
                    Hanya ini
                  </button>
                </label>
              ))
            }
            {uniqueValues.filter(val => val.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
              <div className="p-4 text-center text-sm text-slate-500">
                Data tidak ditemukan
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}