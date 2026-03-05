import React, { useEffect, useState } from 'react';

export default function MainContent({ activeSubMenu, menus }) {
  const [sheetData, setSheetData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Penyesuaian ukuran icon agar lebih kecil (w-6 h-6)
  const activeIcon = menus.find(m => m.label === activeSubMenu.parentLabel)?.icon || (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:8000/api/get-sheet-data');
        if (!response.ok) throw new Error('Gagal mengambil data dari server');
        
        const data = await response.json();
        setSheetData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeSubMenu]); 

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 p-4 md:p-6 lg:p-8">
      
      {/* 1. Bagian Header (Digeser ke kiri & diperkecil) */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm">
              {activeIcon}
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight uppercase">
              {activeSubMenu.childLabel || activeSubMenu.parentLabel}
            </h2>
          </div>
          <p className="text-sm text-gray-500 font-medium ml-12">
            Sumber Data: <span className="text-blue-600">{activeSubMenu.parentLabel}</span>
          </p>
        </div>
        
        {/* Badge Status Live Connection */}
        <div className="flex items-center gap-2 text-xs md:text-sm px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200 font-medium w-fit shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          Live Data Terhubung
        </div>
      </div>

      {/* 2. Container Card Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500 font-medium animate-pulse">Menyinkronkan data dari Google Sheets...</p>
            </div>
          ) : error ? (
            <div className="m-6 bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl flex items-center gap-3">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div>
                <p className="font-bold">Gagal memuat data</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50/80 border-b border-gray-200">
                  <tr>
                    {sheetData[0]?.map((header, idx) => (
                      <th key={idx} className="px-6 py-4 text-left font-extrabold text-gray-700 uppercase tracking-wider text-xs">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {sheetData.slice(1, 11).map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-blue-50/40 transition-colors duration-150">
                      {row.map((cell, cellIdx) => (
                        <td key={cellIdx} className="px-6 py-3.5 text-gray-600 whitespace-nowrap font-medium">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Footer Tabel */}
              {sheetData.length > 11 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                  <p className="text-xs text-gray-500 font-medium">Menampilkan <span className="font-bold text-gray-700">10</span> baris pertama</p>
                  <p className="text-xs text-gray-400">Total data: {sheetData.length - 1} Baris</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}