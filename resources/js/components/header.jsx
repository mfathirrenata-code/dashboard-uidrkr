import React from 'react';

export default function Header({ activeSubMenu, setIsSidebarOpen }) {
  const displayTitle = activeSubMenu.childLabel === 'DASHBOARD UIDRKR' 
    ? 'Overview' 
    : (activeSubMenu.childLabel || activeSubMenu.parentLabel);

  return (
    <header className="h-16 bg-white shadow-sm flex items-center px-4 md:px-8 border-b border-gray-200">
      
      {/* Tombol Hamburger (Mobile) */}
      <button 
        className="md:hidden mr-4 p-2 rounded-md text-gray-500 hover:text-blue-600 hover:bg-gray-100 transition-colors"
        onClick={() => setIsSidebarOpen(true)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {/* Breadcrumb Judul */}
      <div className="flex flex-col">
        <span className="text-xs text-blue-500 font-bold uppercase tracking-wider">
          {activeSubMenu.parentLabel}
        </span>
        <h2 className="text-lg font-extrabold text-gray-800 uppercase tracking-wide truncate max-w-[200px] sm:max-w-md">
          {displayTitle}
        </h2>
      </div>
      
    </header>
  );
}