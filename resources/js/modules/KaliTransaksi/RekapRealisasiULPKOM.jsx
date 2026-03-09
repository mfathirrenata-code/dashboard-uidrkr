import React, { useEffect, useState, useMemo } from 'react';
import { useSortableData } from "@/utils/sorting.js";
import Pagination from "@/components/pagination.jsx"; 

// 1. IMPORT RECHARTS DI SINI
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function RekapRealisasiULPKOM() {
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // State Halaman
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  // Panggil Custom Hook Sorting dari utils
  const { items: sortedData, requestSort, sortConfig } = useSortableData(tableData);

  // Fetch API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); 
      setError(null);
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/get-sheet-data?type=rekap_ulp`);
        
        if (!response.ok) throw new Error(`Server Error: ${response.status} - Gagal mengambil data ULP`);
        
        const data = await response.json();
        if (data && !data.error && Array.isArray(data.tabelULP)) {
          setTableData(data.tabelULP);
        } else {
          setTableData([]); 
        }
      } catch (err) { 
        setError(err.message || "Data tabel tidak ditemukan di server");
      } finally { 
        setIsLoading(false); 
      }
    };

    fetchData();
  }, []);

  // ==========================================
  // LOGIKA TRANSFORMASI DATA UNTUK CHART
  // ==========================================
  const { chartData, uniqueUnits } = useMemo(() => {
    if (!tableData || tableData.length === 0) return { chartData: [], uniqueUnits: [] };

    const groupedByMonth = {};
    const units = new Set();

    // Mapping urutan bulan biar grafik berurutan dari kiri ke kanan
    const monthOrder = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    tableData.forEach(item => {
      // Ambil nama bulan dan unit, antisipasi kalau ada yang kosong (null/undefined)
      const month = item.bulan ? item.bulan.toUpperCase().substring(0, 3) : 'UNK'; 
      const unit = item.unit_up || 'UNKNOWN';
      
      // Ambil nilai real, pastikan jadi tipe angka (number)
      // Kalau datanya string pake koma (misal "2,9"), kita ubah jadi titik biar terbaca di JS
      let realValue = item.real;
      if (typeof realValue === 'string') {
        realValue = parseFloat(realValue.replace(',', '.'));
      } else {
        realValue = Number(realValue);
      }

      // Kelompokkan berdasarkan bulan
      if (!groupedByMonth[month]) {
        groupedByMonth[month] = { name: month };
      }
      
      groupedByMonth[month][unit] = isNaN(realValue) ? 0 : realValue;
      units.add(unit);
    });

    // Ubah Object jadi Array dan urutkan sesuai bulan kalender
    const chartArray = Object.values(groupedByMonth).sort((a, b) => {
      return monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name);
    });

    return { chartData: chartArray, uniqueUnits: Array.from(units) };
  }, [tableData]);

  // Palet warna untuk garis grafik (bisa nampung banyak unit sekaligus)
  const lineColors = ['#00A2E9', '#00D8B6', '#E91E63', '#FFC107', '#FF5252', '#FF9800', '#9C27B0', '#4CAF50', '#8BC34A', '#00BCD4'];

  // ==========================================
  // LOGIKA TABEL & PAGINATION
  // ==========================================
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const handleSort = (key) => {
    requestSort(key);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <main className="flex-1 bg-[#F8FAFC] p-8 flex flex-col items-center justify-center min-h-[80vh]">
        <svg className="animate-spin h-10 w-10 text-[#00A2E9] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-sm text-[#64748B] font-medium mt-1">Mengambil informasi terbaru dari server...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 bg-[#F8FAFC] p-8">
        <div className="flex flex-col items-center justify-center py-20 bg-red-50 rounded-2xl border border-red-200 text-center px-4">
          <h3 className="text-xl font-black text-red-600 mb-2">Gagal Memuat Data</h3>
          <p className="text-red-500 max-w-md">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700">Coba Lagi</button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      
      {/* ========================================== */}
      {/* BAGIAN CHART RECHARTS */}
      {/* ========================================== */}
      {chartData.length > 0 && (
        <div className="w-full bg-[#3B52A4] rounded-2xl p-6 shadow-md border border-[#2D4185] mb-8">
          <div className="mb-6">
            <h3 className="text-[#00A2E9] text-xs font-black uppercase tracking-wider">Nilai Realisasi</h3>
            <h2 className="text-white text-xl font-black uppercase">Rekap Realisasi ULP KOM</h2>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#ffffff40" />
                
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff80" 
                  tick={{ fill: '#ffffff', fontSize: 12, fontWeight: 'bold' }} 
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                
                <YAxis 
                  stroke="#ffffff80" 
                  tick={{ fill: '#ffffff', fontSize: 12 }} 
                  tickLine={false}
                  axisLine={false}
                />
                
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                
                <Legend 
                  wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }} 
                  iconType="plainline" 
                  verticalAlign="top" 
                  height={36}
                />

                {/* Looping otomatis untuk membuat garis berdasarkan jumlah unit dari API */}
                {uniqueUnits.map((unit, index) => (
                  <Line 
                    key={unit}
                    type="monotone" 
                    dataKey={unit} 
                    name={unit} 
                    stroke={lineColors[index % lineColors.length]} 
                    strokeWidth={2.5} 
                    dot={false} 
                    activeDot={{ r: 6 }} 
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* BAGIAN TABEL */}
      {/* ========================================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        
        <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-[#0F172A] tracking-tight">Rincian Realisasi Transaksi ULP KOM</h2>
            <p className="text-sm text-[#64748B] font-medium mt-1">
              Menampilkan <span className="font-bold text-[#0F172A]">{sortedData.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, sortedData.length)}</span> dari total <span className="font-bold text-[#0F172A]">{sortedData.length}</span> baris data
            </p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase text-xs font-black border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 w-16">No</th>
                <th className="px-6 py-4">Unit UP</th>
                <th className="px-6 py-4 text-center">Bulan</th>
                <th className="px-6 py-4 text-center">Target</th>
                <th className="px-6 py-4 text-center">Real</th>
                <th className="px-6 py-4 text-center border-l border-[#E2E8F0] w-32">%</th>
                
                <th 
                  className="px-6 py-4 text-center border-l border-[#E2E8F0] w-28 cursor-pointer group hover:bg-slate-200 active:bg-slate-300 transition-colors select-none"
                  onClick={() => handleSort('rank')}
                  title="Klik untuk mengurutkan Rank"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Rank</span>
                    <span className={`transition-colors ${sortConfig?.key === 'rank' ? 'text-slate-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                      {sortConfig?.direction === 'asc' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      )}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-[#64748B] font-medium">
                    Belum ada data yang tersedia atau format data tidak sesuai.
                  </td>
                </tr>
              ) : (
                currentItems.map((row, idx) => {
                  const isTargetAchieved = (row['%'] || row.persen || 0) >= 100;
                  return (
                    <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#0F172A]">{indexOfFirstItem + idx + 1}</td>
                      <td className="px-6 py-4 font-bold text-[#0F172A]">{row.unit_up || '-'}</td>
                      <td className="px-6 py-4 font-bold text-[#475569] text-center">{row.bulan || '-'}</td>
                      <td className="px-6 py-4 text-center font-medium text-[#475569]">{row.target?.toLocaleString() || '0'}</td>
                      <td className="px-6 py-4 text-center font-black text-[#00A2E9]">{row.real?.toLocaleString() || '0'}</td>
                      <td className={`px-6 py-4 text-center text-sm font-black ${isTargetAchieved ? 'bg-green-50/60 text-green-700' : 'bg-red-50/60 text-red-700'}`}>
                        {row['%'] || row.persen || 0}%
                      </td>
                      <td className="px-6 py-4 text-center border-l border-[#E2E8F0] font-black text-[#F59E0B]">
                        #{row.rank || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {sortedData.length > 0 && (
          <Pagination 
            totalItems={sortedData.length} 
            itemsPerPage={itemsPerPage} 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
          />
        )}
      </div>
    </main>
  );
}