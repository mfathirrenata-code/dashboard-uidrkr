import React, { useEffect, useState, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Line, Cell, Legend
} from 'recharts';
import TableFilter from '@/components/shared/tablefilter.jsx';
// 1. UBAH IMPORT DI SINI
import ExportOptionsButton from '@/components/shared/ExportOptionsButton';

export default function DashboardRP() {
  const [sheetData, setSheetData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ==========================================
  // STATE UNTUK FILTER BULAN & SCREENSHOT
  // ==========================================
  const [selectedBulanFilters, setSelectedBulanFilters] = useState([]);
  const [isBulanFilterOpen, setIsBulanFilterOpen] = useState(false);
  const myTableRef = useRef(null);
  const [isScreenshotting, setIsScreenshotting] = useState(false);

  // ==========================================
  // FETCH API DARI LARAVEL
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/rupiah/dashboard`);

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
  }, []);

  // ==========================================
  // DERIVED DATA (LOGIKA FILTERING)
  // ==========================================
  const uniqueBulanValues = sheetData && sheetData.monthlyData ? sheetData.monthlyData.map(item => item.name) : [];

  const filteredMonthlyData = sheetData && sheetData.monthlyData
    ? (selectedBulanFilters.length > 0
      ? sheetData.monthlyData.filter(item => selectedBulanFilters.includes(item.name))
      : sheetData.monthlyData)
    : [];

  // ==========================================
  // TAMPILAN LOADING
  // ==========================================
  if (isLoading) {
    return (
      <main className="flex-1 bg-[#F8FAFC] p-6 flex flex-col items-center justify-center min-h-[80vh]">
        <svg className="animate-spin h-8 w-8 text-[#00A2E9] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-[13px] text-[#64748B] font-medium mt-1">Mengambil informasi terbaru dari server...</p>
      </main>
    );
  }

  // ==========================================
  // TAMPILAN ERROR
  // ==========================================
  if (error) {
    return (
      <main className="flex-1 bg-[#F8FAFC] p-6">
        <div className="flex flex-col items-center justify-center py-12 bg-red-50 rounded-xl border border-red-200 text-center px-4">
          <div className="bg-red-100 p-2.5 rounded-full mb-3">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h3 className="text-lg font-black text-red-600 mb-1">Gagal Memuat Data</h3>
          <p className="text-sm text-red-500 max-w-md">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-1.5 text-sm bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
          >
            Refresh Halaman
          </button>
        </div>
      </main>
    );
  }

  // ==========================================
  // TAMPILAN UTAMA
  // ==========================================
  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-3 md:p-4 lg:p-6">

      {/* HEADER DASHBOARD DENGAN FILTER */}
      <div className="mb-4 bg-white rounded-xl shadow-sm border border-[#E2E8F0] border-t-[3px] border-t-[#00A2E9] flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-3 sm:p-4 animate-in fade-in duration-500">
        <div>
          <h1 className="text-base font-black text-[#0F172A] uppercase tracking-tight">
            Dashboard Realisasi
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Performa PLN Mobile UID Riau & Kepri
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto relative z-[60]">
          {uniqueBulanValues.length > 0 && (
            <TableFilter
              compactMode={true}
              alignRight={true}
              columnName="BULAN"
              uniqueValues={uniqueBulanValues}
              selectedFilters={selectedBulanFilters}
              onFilterChange={setSelectedBulanFilters}
              isOpen={isBulanFilterOpen}
              onToggle={() => setIsBulanFilterOpen(!isBulanFilterOpen)}
            />
          )}
        </div>
      </div>

      {sheetData && (
        <div className="space-y-4 animate-in fade-in duration-700">

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E8F0]">
              <p className="text-[#64748B] font-bold text-[11px] uppercase tracking-wider mb-1">Realisasi (YTD)</p>
              <h3 className="text-2xl font-black text-[#00A2E9]">{sheetData.real || '0'}</h3>
              <div className="mt-2.5 flex justify-between text-[11px] font-bold text-[#94A3B8] mb-1">
                <span>Progress</span><span>{sheetData.persenTahunan || 0}%</span>
              </div>
              <div className="w-full bg-[#F1F5F9] rounded-full h-1.5">
                <div className="bg-[#00A2E9] h-1.5 rounded-full" style={{ width: `${Math.min(sheetData.persenTahunan || 0, 100)}%` }}></div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E8F0] flex items-center justify-between">
              <div>
                <p className="text-[#64748B] font-bold text-[11px] uppercase tracking-wider mb-1">Kumulatif Update</p>
                <h3 className="text-2xl font-black text-[#34D399]">{sheetData.kumUpdate || 0}%</h3>
                <p className="text-[11px] font-medium text-[#94A3B8] mt-0.5">Status Kinerja</p>
              </div>
              <div className="p-2.5 bg-[#D1FAE5] rounded-full text-[#34D399]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                </svg>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E8F0] flex items-center justify-between">
              <div>
                <p className="text-[#64748B] font-bold text-[11px] uppercase tracking-wider mb-1">Total Carry Over</p>
                <h3 className="text-2xl font-black text-[#F59E0B]">{sheetData.carryOver || '0'}</h3>
                <p className="text-[11px] font-bold text-[#F59E0B] mt-0.5">Kontribusi: {sheetData.komCarryOver || 0}%</p>
              </div>
              <div className="p-2.5 bg-[#FEF3C7] rounded-full text-[#F59E0B]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#00A2E9] to-[#007EA7] p-4 rounded-xl shadow-sm text-white">
              <p className="text-white/80 font-bold text-[11px] uppercase tracking-wider mb-1">UP3 Terbaik</p>
              <h3 className="text-xl font-black mt-1.5 leading-tight">
                {sheetData.kinerjaUP3?.[0]?.nama || 'Belum Ada Data'}
              </h3>
              <div className="mt-2 inline-block bg-white/20 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-white/30">
                {sheetData.kinerjaUP3?.[0]?.realisasi?.toLocaleString() || 0} TRX
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* CHARTS SECTION (COMPOSED CHART ASLI) */}
          {/* ========================================== */}

          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden flex flex-col mt-3">
            <div className="p-4 border-b border-[#E2E8F0] bg-white">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">
                  <svg className="w-4 h-4 text-[#EC4899]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Tren Realisasi vs Target</h3>
                  <p className="text-[11px] text-[#64748B] font-medium mt-0.5">Perbandingan target, realisasi, dan persentase kumulatif.</p>
                </div>
              </div>
            </div>

            <div className="p-3 h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={filteredMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} dy={8} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)} rb` : v} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#A78BFA', fontSize: 10, fontWeight: 'bold' }} tickFormatter={(v) => `${v}%`} />

                  <Tooltip
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontWeight: 'bold', fontSize: '12px', padding: '8px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} iconType="circle" iconSize={8} />

                  <Bar yAxisId="left" dataKey="target" name="Target" fill="#E2E8F0" radius={[3, 3, 0, 0]} barSize={30} />
                  <Bar yAxisId="left" dataKey="real" name="Realisasi" fill="#00A2E9" radius={[3, 3, 0, 0]} barSize={30} activeBar={{ fill: '#008CC9' }} />
                  <Line yAxisId="right" type="monotone" dataKey="persen" name="% Kumulatif" stroke="#A78BFA" strokeWidth={3} dot={{ r: 4, fill: '#A78BFA', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ========================================== */}
          {/* TABLE SECTION DENGAN GAYA UIDRKR */}
          {/* ========================================== */}
          <div className="flex items-center gap-3 mt-4">
            <span className="inline-block px-3 py-1 bg-[#EC4899] text-white font-black rounded-md text-[11px] uppercase shadow-sm tracking-wide">
              Tabel Rincian
            </span>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-[#E2E8F0] to-transparent rounded-full"></div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden mt-3">

            <div className="p-4 border-b border-[#E2E8F0] bg-white flex justify-between items-center">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">
                  <svg className="w-4 h-4 text-[#EC4899]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#0F172A] tracking-tight">Rincian Data Bulanan</h3>
                  <p className="text-[11px] text-[#64748B] font-medium mt-0.5">Detail target dan realisasi bulanan</p>
                </div>
              </div>

              {/* 2. UBAH PEMANGGILAN KOMPONEN DI SINI */}
              <ExportOptionsButton
                targetRef={myTableRef}
                fileName="Tabel_Realisasi"
                buttonText="Export"
                onStateChange={setIsScreenshotting}
                className="px-3 py-1.5 text-[12px]"
              />
            </div>

            <div ref={myTableRef} className={isScreenshotting ? "h-auto pb-4 bg-white w-max min-w-full" : "overflow-hidden"}>
              <div className={isScreenshotting ? "" : "overflow-x-auto"}>
                <table className="w-full text-center text-[13px] whitespace-nowrap">
                  <thead className="bg-[#F8FAFC] text-[#64748B] uppercase text-[11px] font-black border-b border-[#E2E8F0]">
                    <tr>
                      <th className="px-3 py-3 text-center w-12 left-0 z-10 bg-[#F8FAFC] border-r border-[#E2E8F0]">NO</th>
                      <th className="px-4 py-3 text-center w-28">Bulan</th>
                      <th className="px-4 py-3 text-center">Target</th>
                      <th className="px-4 py-3 text-center">Realisasi</th>
                      <th className="px-4 py-3 text-center">Pencapaian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] bg-white text-[#0F172A]">
                    {filteredMonthlyData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors font-medium">
                        <td className="px-3 py-2.5 text-center font-bold text-[#94A3B8] sticky left-0 z-10 bg-white border-r border-[#E2E8F0] shadow-[2px_0_4px_-1px_rgba(0,0,0,0.05)]">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2.5 text-center font-bold text-[#00A2E9]">
                          {row.name}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {row.target?.toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {row.real?.toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {row.persen?.toLocaleString('id-ID')}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}
    </main>
  );
}