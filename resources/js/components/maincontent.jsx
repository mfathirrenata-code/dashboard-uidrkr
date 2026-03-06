import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ComposedChart, Line, Cell
} from 'recharts'; // PieChart & Pie udah gue hapus karena gak dipakai lagi

export default function MainContent({ activeSubMenu }) {
  const [sheetData, setSheetData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isKaliTransaksi = activeSubMenu.parentLabel === 'KALI TRANSAKSI';
  const isDashboardUIDRKR = activeSubMenu.childLabel === 'DASHBOARD UIDRKR';

  // ==========================================
  // FETCH API DARI LARAVEL
  // ==========================================
  useEffect(() => {
    if (!isKaliTransaksi) {
      setSheetData(null);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true); 
      setError(null);
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/get-sheet-data?type=kali`);
        
        if (!response.ok) {
          throw new Error(`Server Error: ${response.status} - Gagal mengambil data`);
        }
        
        const data = await response.json();
        
        if (data && !data.error) {
          setSheetData(data);
        } else {
          throw new Error(data.error || "Format data dari server tidak dikenali");
        }
      } catch (err) { 
        setError(err.message); 
        console.error("Fetch Error:", err);
      } finally { 
        setIsLoading(false); 
      }
    };

    fetchData();
  }, [activeSubMenu.childLabel, isKaliTransaksi]);


  if (!isKaliTransaksi) {
    return (
      <main className="flex-1 bg-[#F8FAFC] p-8">
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl shadow-sm border border-[#E2E8F0]">
          <h3 className="text-xl font-bold text-[#64748B]">Modul {activeSubMenu.childLabel} Segera Hadir</h3>
        </div>
      </main>
    );
  }

  // ==========================================
  // TAMPILAN LOADING (Tanpa Container Putih)
  // ==========================================
  if (isLoading) {
    return (
      <main className="flex-1 bg-[#F8FAFC] p-8 flex flex-col items-center justify-center min-h-[80vh]">
        <svg className="animate-spin h-10 w-10 text-[#00A2E9] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h3 className="text-lg font-black text-[#0F172A]">Memuat Data</h3>
        <p className="text-sm text-[#64748B] font-medium mt-1">Mengambil informasi terbaru dari server...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 bg-[#F8FAFC] p-8">
        <div className="flex flex-col items-center justify-center py-20 bg-red-50 rounded-2xl border border-red-200 text-center px-4">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h3 className="text-xl font-black text-red-600 mb-2">Gagal Memuat Data</h3>
          <p className="text-red-500 max-w-md">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
          >
            Refresh Halaman
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
      
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">
            {isDashboardUIDRKR ? 'Dashboard Realisasi' : activeSubMenu.childLabel}
          </h2>
          <p className="text-sm text-[#64748B] font-medium mt-1">
            {isDashboardUIDRKR ? 'Performa PLN Mobile UID Riau & Kepri' : `Laporan Bulanan ${activeSubMenu.parentLabel}`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#64748B]">Periode:</span>
          <select className="px-4 py-2 bg-white border border-[#E2E8F0] rounded-xl shadow-sm text-[#0F172A] font-bold focus:outline-none focus:ring-2 focus:ring-[#00A2E9]">
            <option>Tahun 2026</option>
          </select>
        </div>
      </div>

      {sheetData && (
        <div className="space-y-6 animate-in fade-in duration-700">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E2E8F0]">
              <p className="text-[#64748B] font-bold text-xs uppercase tracking-wider mb-1">Realisasi (YTD)</p>
              <h3 className="text-3xl font-black text-[#00A2E9]">{sheetData.real || '0'}</h3>
              <div className="mt-4 flex justify-between text-xs font-bold text-[#94A3B8] mb-1">
                <span>Progress</span><span>{sheetData.persenTahunan || 0}%</span>
              </div>
              <div className="w-full bg-[#F1F5F9] rounded-full h-2">
                <div className="bg-[#00A2E9] h-2 rounded-full" style={{ width: `${Math.min(sheetData.persenTahunan || 0, 100)}%` }}></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E2E8F0] flex items-center justify-between">
              <div>
                <p className="text-[#64748B] font-bold text-xs uppercase tracking-wider mb-1">Kumulatif Update</p>
                <h3 className="text-3xl font-black text-[#34D399]">{sheetData.kumUpdate || 0}%</h3>
                <p className="text-xs font-medium text-[#94A3B8] mt-1">Status Kinerja</p>
              </div>
              {/* ICON STATIS (Pengganti MiniDonut) */}
              <div className="p-3 bg-[#D1FAE5] rounded-full text-[#34D399]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                </svg>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E2E8F0] flex items-center justify-between">
              <div>
                <p className="text-[#64748B] font-bold text-xs uppercase tracking-wider mb-1">Total Carry Over</p>
                <h3 className="text-3xl font-black text-[#F59E0B]">{sheetData.carryOver || '0'}</h3>
                <p className="text-xs font-bold text-[#F59E0B] mt-1">Kontribusi: {sheetData.komCarryOver || 0}%</p>
              </div>
              <div className="p-3 bg-[#FEF3C7] rounded-full text-[#F59E0B]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#00A2E9] to-[#007EA7] p-5 rounded-2xl shadow-sm text-white">
              <p className="text-white/80 font-bold text-xs uppercase tracking-wider mb-1">UP3 Terbaik</p>
              <h3 className="text-2xl font-black mt-2">
                {sheetData.kinerjaUP3?.[0]?.nama || 'Belum Ada Data'}
              </h3>
              <div className="mt-2 inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-white/30">
                {sheetData.kinerjaUP3?.[0]?.realisasi?.toLocaleString() || 0} TRX
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0]">
              <h3 className="text-lg font-black text-[#0F172A] mb-6">Tren Realisasi vs Target</h3>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={sheetData.monthlyData || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 11}} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#A78BFA', fontSize: 11, fontWeight: 'bold'}} />
                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                    <Bar yAxisId="left" dataKey="target" name="Target" fill="#E2E8F0" radius={[4, 4, 0, 0]} barSize={30} />
                    <Bar yAxisId="left" dataKey="real" name="Realisasi" fill="#00A2E9" radius={[4, 4, 0, 0]} barSize={30} />
                    <Line yAxisId="right" type="monotone" dataKey="persen" name="% Kumulatif" stroke="#A78BFA" strokeWidth={3} dot={{r: 4}} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0]">
              <h3 className="text-lg font-black text-[#0F172A] mb-6">Peringkat UP3</h3>
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sheetData.kinerjaUP3 || []} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="nama" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} width={90} />
                    <Tooltip cursor={{fill: '#F8FAFC'}} />
                    <Bar dataKey="realisasi" fill="#00A2E9" radius={[0, 4, 4, 0]} barSize={20}>
                      {(sheetData.kinerjaUP3 || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#34D399' : '#00A2E9'} opacity={1 - (index * 0.05)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            <div className="p-6 border-b border-[#E2E8F0] bg-[#F0F9FF]">
              <h3 className="text-lg font-black text-[#0F172A]">Rincian Data Bulanan</h3>
              <p className="text-xs text-[#64748B] font-medium mt-1">Detail target dan realisasi bulanan</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8FAFC] text-[#64748B] uppercase text-xs font-black">
                  <tr>
                    <th className="px-6 py-4">Bulan</th>
                    <th className="px-6 py-4 text-right">Target</th>
                    <th className="px-6 py-4 text-right">Realisasi</th>
                    <th className="px-6 py-4 text-right">Pencapaian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {(sheetData.monthlyData || []).map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors hover:shadow-inner">
                      <td className="px-6 py-4 font-bold text-[#475569]">{row.name}</td>
                      <td className="px-6 py-4 text-right font-medium">{row.target?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right font-black text-[#00A2E9]">{row.real?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${row.persen >= 100 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {row.persen}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}