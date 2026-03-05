import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MainContent({ activeSubMenu, menus }) {
  const [sheetData, setSheetData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const activeIcon = menus.find(m => m.label === activeSubMenu.parentLabel)?.icon || (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
  );

  // LOGIKA PEMBATAS: Cek apakah user sedang berada di menu KALI TRANSAKSI
  const isKaliTransaksi = activeSubMenu.parentLabel === 'KALI TRANSAKSI';

  useEffect(() => {
    // Kalau bukan menu KALI TRANSAKSI, jangan buang-buang kuota internet buat narik data
    if (!isKaliTransaksi) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Karena sekarang kita cuma fokus ke 'kali', kita tembak API-nya langsung ke 'kali'
        const response = await fetch(`http://localhost:8000/api/get-sheet-data?type=kali`);
        
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
  }, [activeSubMenu, isKaliTransaksi]);

  const chartData = useMemo(() => {
    if (!sheetData || sheetData.length < 2) return [];
    
    const headers = sheetData[0];
    const rows = sheetData.slice(1, 11); 

    return rows.map(row => {
      let obj = { name: row[0] };
      for (let i = 1; i < headers.length; i++) {
        const cleanNumber = String(row[i]).replace(/,/g, '').replace(/\./g, '');
        obj[headers[i]] = isNaN(Number(cleanNumber)) ? 0 : Number(cleanNumber);
      }
      return obj;
    });
  }, [sheetData]);

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50/50 p-4 md:p-6 lg:p-8">
      
      {/* HEADER TINGGAL SINI */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-600 text-white rounded-lg shadow-sm">
              {activeIcon}
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight uppercase">
              {activeSubMenu.childLabel === 'DASHBOARD UIDRKR' 
                ? 'RINGKASAN DATA' 
                : activeSubMenu.childLabel || 'RINGKASAN DATA'}
            </h2>
          </div>
          <p className="text-sm text-gray-500 font-medium ml-12">
            Menampilkan laporan detail untuk <span className="text-blue-600 font-bold">{activeSubMenu.parentLabel}</span>
          </p>
        </div>
        
        {isKaliTransaksi && (
          <div className="flex items-center gap-2 text-xs md:text-sm px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200 font-medium w-fit shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            Live Data Terhubung
          </div>
        )}
      </div>

      {/* KONDISI TAMPILAN KONTEN */}
      {!isKaliTransaksi ? (
        // 1. JIKA BUKAN MENU "KALI TRANSAKSI", TAMPILKAN INI:
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-xl shadow-sm border border-gray-200 border-dashed">
          <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Segera Hadir</h3>
          <p className="text-gray-500 text-center max-w-md">
            Integrasi Google Sheet untuk menu <span className="font-bold text-gray-700">{activeSubMenu.parentLabel}</span> sedang dalam tahap pengembangan.
          </p>
        </div>
      ) : isLoading ? (
        // 2. JIKA LOADING:
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500 font-medium animate-pulse">Menyinkronkan data dari Google Sheets...</p>
        </div>
      ) : error ? (
        // 3. JIKA ERROR:
        <div className="m-6 bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl flex items-center gap-3">
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <div>
            <p className="font-bold">Gagal memuat data</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : sheetData.length > 0 ? (
        // 4. JIKA DATA KALI TRANSAKSI BERHASIL DIMUAT:
        <div className="space-y-6">
          {/* AREA GRAFIK (CHART) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Grafik Pencapaian</h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  {sheetData[0].slice(1).map((headerName, index) => (
                    <Bar key={index} dataKey={headerName} fill={colors[index % colors.length]} radius={[4, 4, 0, 0]} barSize={40} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AREA TABEL */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
              {sheetData.length > 11 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                  <p className="text-xs text-gray-500 font-medium">Menampilkan <span className="font-bold text-gray-700">10</span> baris pertama</p>
                  <p className="text-xs text-gray-400">Total data: {sheetData.length - 1} Baris</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}