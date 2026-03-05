import React from 'react';

export default function MainContent({ activeSubMenu, menus }) {
  // Mencari icon yang sesuai dengan menu yang sedang aktif
  const activeIcon = menus.find(m => m.label === activeSubMenu.parentLabel)?.icon || (
    <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
  );

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-full flex flex-col items-center justify-center p-6 text-center">
        
        <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
          {activeIcon}
        </div>
        
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
          Visualisasi <span className="text-blue-600 block md:inline">{activeSubMenu.childLabel || activeSubMenu.parentLabel}</span>
        </h3>
        
        <p className="text-gray-500 max-w-lg text-sm md:text-lg">
          Data dan grafik untuk <span className="font-semibold text-gray-600">{activeSubMenu.parentLabel} &gt; {activeSubMenu.childLabel}</span> akan ditampilkan di sini.
        </p>
        
      </div>
    </main>
  );
}