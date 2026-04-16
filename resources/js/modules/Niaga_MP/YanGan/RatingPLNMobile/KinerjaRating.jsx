import React, { useEffect, useState, useMemo, useRef } from 'react';
import Pagination from '@/components/shared/pagination.jsx';
import { useSortableData, SortIcon } from "@/utils/sorting.jsx";
import TableFilter from '@/components/shared/tablefilter.jsx';

// 1. Ubah import menjadi ExportOptionsButton
import ExportOptionsButton from '@/components/shared/ExportOptionsButton'; 

export default function KinerjaRating() {
  const [tableDataULP, setTableDataULP] = useState([]);
  const [tableDataUP3, setTableDataUP3] = useState([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ==========================================
  // STATE UNTUK EXPORT MASING-MASING TABEL
  // ==========================================
  const tableRefUP3 = useRef(null);
  const [isScreenshottingUP3, setIsScreenshottingUP3] = useState(false);

  const tableRefULP = useRef(null);
  const [isScreenshottingULP, setIsScreenshottingULP] = useState(false);

  // ==========================================
  // LOGIKA GLOBAL FILTER BULAN
  // ==========================================
  const [selectedBulanFilters, setSelectedBulanFilters] = useState([]);
  const [isBulanFilterOpen, setIsBulanFilterOpen] = useState(false); // Bisa dibiarkan saja
  const hasInitializedFilter = useRef(false);

  // 1. Ambil list bulan unik dari data asli ULP
  const getMonthIndex = (monthStr) => {
    if (!monthStr) return 99;
    const m = monthStr.toUpperCase();
    if (m.startsWith('JAN')) return 1;
    if (m.startsWith('FEB')) return 2;
    if (m.startsWith('MAR')) return 3;
    if (m.startsWith('APR')) return 4;
    if (m.startsWith('MAY') || m.startsWith('MEI')) return 5;
    if (m.startsWith('JUN')) return 6;
    if (m.startsWith('JUL')) return 7;
    if (m.startsWith('AUG') || m.startsWith('AGU')) return 8;
    if (m.startsWith('SEP')) return 9;
    if (m.startsWith('OCT') || m.startsWith('OKT')) return 10;
    if (m.startsWith('NOV')) return 11;
    if (m.startsWith('DEC') || m.startsWith('DES')) return 12;
    return 99;
  };

  const uniqueBulanValues = useMemo(() => {
    if (!tableDataULP || tableDataULP.length === 0) return [];
    const bulans = tableDataULP.map(item => item.bulan || '-');
    return [...new Set(bulans)].sort((a, b) => getMonthIndex(a) - getMonthIndex(b));
  }, [tableDataULP]);

  // 2. Set default filter tercentang semua saat data pertama kali di-load
  useEffect(() => {
    if (uniqueBulanValues.length > 0 && !hasInitializedFilter.current) {
      setSelectedBulanFilters(uniqueBulanValues);
      hasInitializedFilter.current = true;
    }
  }, [uniqueBulanValues]);

  // 3. Filter Data UP3 secara Global
  const filteredDataUP3 = useMemo(() => {
    if (selectedBulanFilters.length === 0) return tableDataUP3;
    return tableDataUP3.filter(row => selectedBulanFilters.includes(row.bulan || '-'));
  }, [tableDataUP3, selectedBulanFilters]);

  // 4. Filter Data ULP secara Global
  const filteredDataULP = useMemo(() => {
    if (selectedBulanFilters.length === 0) return tableDataULP;
    return tableDataULP.filter(row => selectedBulanFilters.includes(row.bulan || '-'));
  }, [tableDataULP, selectedBulanFilters]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Reset pagination ke halaman 1 kalau filternya diganti
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBulanFilters]);

  // Inisialisasi Sorting MENGGUNAKAN DATA YANG SUDAH DIFILTER
  const { items: sortedDataULP, requestSort: sortULP, sortConfig: configULP } = useSortableData(filteredDataULP);
  const { items: sortedDataUP3, requestSort: sortUP3, sortConfig: configUP3 } = useSortableData(filteredDataUP3);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [responseULP, responseUP3] = await Promise.all([
          fetch(`http://127.0.0.1:8000/api/rating/rekap-ulp`),
          fetch(`http://127.0.0.1:8000/api/rating/rekap-up3`)
        ]);

        if (!responseULP.ok) throw new Error(`Server Error: ${responseULP.status} - Gagal mengambil data tabel ULP`);
        if (!responseUP3.ok) throw new Error(`Server Error: ${responseUP3.status} - Gagal mengambil data tabel UP3`);

        const dataULP = await responseULP.json();
        const dataUP3 = await responseUP3.json();

        // Set Data ULP
        if (dataULP && !dataULP.error) {
          if (Array.isArray(dataULP.tabelRating)) {
            setTableDataULP(dataULP.tabelRating);
          } else if (Array.isArray(dataULP)) {
            setTableDataULP(dataULP);
          } else {
            setTableDataULP([]);
          }
        } else {
          throw new Error(dataULP.error || "Data tabel ULP tidak ditemukan");
        }

        // Set Data UP3
        if (dataUP3 && !dataUP3.error) {
          if (Array.isArray(dataUP3.tabelRating)) {
            setTableDataUP3(dataUP3.tabelRating);
          } else if (Array.isArray(dataUP3)) {
            setTableDataUP3(dataUP3);
          } else {
            setTableDataUP3([]);
          }
        } else {
          console.error("Data tabel UP3 tidak ditemukan di response:", dataUP3);
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

  const handleSortULP = (key) => {
    sortULP(key);
    setCurrentPage(1);
  };

  const handleSortUP3 = (key) => {
    sortUP3(key);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItemsULP = sortedDataULP.slice(indexOfFirstItem, indexOfLastItem);

  if (isLoading) {
    return (
      <main className="flex-1 bg-[#F8FAFC] p-4 md:p-8 flex flex-col items-center justify-center min-h-[80vh]">
        <svg className="animate-spin h-8 w-8 text-[#00A2E9] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-1 text-center">Mengambil informasi terbaru dari server...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 bg-[#F8FAFC] p-4 sm:p-8 flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center justify-center py-10 px-6 bg-white rounded-xl shadow-sm border border-[#E2E8F0] text-center max-w-md w-full">
          <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Gagal Memuat Data</h3>
          <p className="text-sm text-[#64748B] mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-[#00A2E9] text-white text-sm font-medium rounded-lg hover:bg-[#0088c4] transition-colors w-full">
            Muat Ulang Halaman
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-4 sm:p-6 md:p-8 w-full">
      <div className="w-full space-y-6 animate-in fade-in duration-500">

        {/* HEADER JUDUL & GLOBAL FILTER */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] border-t-[3px] border-t-[#00A2E9] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 sm:p-5 relative z-20">
          <div>
            <h1 className="text-lg font-black text-[#0F172A] uppercase">
              Monitoring Kinerja Rating
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              PLN Mobile - UID Riau dan Kepulauan Riau
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto z-50">
            <span className="text-sm text-[#64748B] font-bold hidden sm:block">Periode:</span>
            
            {/* 2. PEMANGGILAN TABLEFILTER TERBARU */}
            <TableFilter
              alignRight={true}
              buttonText="Filter Bulan"
              compactMode={false} // Atur true jika ingin ukuran lebih ramping
              filters={[
                {
                  columnName: "Bulan",
                  uniqueValues: uniqueBulanValues,
                  selectedFilters: selectedBulanFilters,
                  onFilterChange: setSelectedBulanFilters,
                  isDatePicker: false
                }
              ]}
            />
          </div>
        </div>

        {/* BAGIAN GRAFIK / CHART */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 sm:p-5 relative">
          <h2 className="text-sm font-black text-[#0F172A] uppercase mb-4">Tren Kinerja Bulanan</h2>
          <div className="relative h-40 sm:h-48 ml-8 border-l border-b border-[#E2E8F0] flex flex-col justify-between pb-2 text-[10px] sm:text-xs text-[#94A3B8]">
            <div className="absolute -left-8 top-0">4.95</div>
            <div className="w-full border-t border-[#F1F5F9] border-dashed"></div>
            <div className="absolute -left-8 top-1/4">4.90</div>
            <div className="w-full border-t border-[#F1F5F9] border-dashed"></div>
            <div className="absolute -left-8 top-2/4">4.85</div>
            <div className="w-full border-t border-[#F1F5F9] border-dashed"></div>
            <div className="absolute -left-8 top-3/4">4.80</div>
            <div className="w-full border-t border-[#E2E8F0]"></div>

            <div className="absolute top-[10%] left-[5%] flex items-center group cursor-pointer">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00A2E9] shadow-[0_0_0_4px_rgba(0,162,233,0.2)]"></div>
              <div className="w-16 border-t-[2px] border-[#00A2E9]"></div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* TABEL 1: REALISASI RATING PER UP3 */}
        {/* ========================================== */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] mt-6">
          
          <div className="p-4 sm:p-6 border-b border-[#E2E8F0] bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-t-xl">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <svg className="w-5 h-5 text-[#00A2E9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-black text-[#0F172A] tracking-tight">Realisasi Rating Per UP3</h3>
                <p className="text-[13px] text-[#64748B] font-medium mt-1">Pemantauan pencapaian target dan persentase kesesuaian rating di tingkat Unit Pelaksana.</p>
              </div>
            </div>

            {/* 3. PEMANGGILAN EXPORT BUTTON UP3 */}
            <ExportOptionsButton 
                targetRef={tableRefUP3} 
                fileName="Tabel_Rating_UP3" // Dihapus .png nya agar dinamis 
                buttonText="Export"
                onStateChange={setIsScreenshottingUP3}
                className="px-4 py-2 text-xs sm:text-sm w-full sm:w-auto"
            />
          </div>

          {/* AREA SCREENSHOT UP3 */}
          <div ref={tableRefUP3} className={isScreenshottingUP3 ? "h-auto pb-4 bg-white w-max min-w-full" : "overflow-hidden"}>
            <div className={isScreenshottingUP3 ? "" : "overflow-x-auto w-full custom-scrollbar"}>
              <table className="w-full text-left text-[11px] sm:text-[12px] whitespace-nowrap">
                <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-4 py-3 text-center font-semibold w-12 sticky left-0 z-10 bg-[#F8FAFC] border-r border-[#E2E8F0]">NO</th>
                    <th className="px-4 py-3 font-semibold cursor-pointer hover:bg-[#E2E8F0]/50 transition-colors" onClick={() => handleSortUP3('up3')}>
                      <div className="flex items-center gap-2">
                        UP3 <SortIcon columnKey="up3" sortConfig={configUP3} />
                      </div>
                    </th>
                    <th className="px-3 py-3 text-center font-semibold">Bulan</th>
                    <th className="px-3 py-3 text-center font-semibold">Target</th>
                    <th className="px-3 py-3 text-center font-semibold">Realisasi</th>
                    <th className="px-3 py-3 text-center font-semibold">% Total Entry</th>
                    <th className="px-3 py-3 text-center font-semibold">Sesuai</th>
                    <th className="px-3 py-3 text-center font-semibold">Tidak Sesuai</th>
                    <th className="px-4 py-3 text-center font-semibold">% Real</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] bg-white text-[#334155]">
                  {sortedDataUP3.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-8 text-center text-[#64748B] text-sm bg-slate-50/50">
                        Belum ada data UP3 yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    sortedDataUP3.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2 sm:py-1.5 text-center font-bold text-[#94A3B8] sticky left-0 z-10 bg-white border-r border-[#E2E8F0] shadow-[2px_0_4px_-1px_rgba(0,0,0,0.05)]">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-2 sm:py-1.5 font-bold text-[#00A2E9]">{row.up3}</td>
                        <td className="px-3 py-2 sm:py-1.5 font-bold text-[#334155] text-center">{row.bulan || '-'}</td>
                        <td className="px-3 py-2 sm:py-1.5 text-center">{row.target}</td>
                        <td className="px-3 py-2 sm:py-1.5 text-center">{row.realisasi}</td>
                        <td className="px-3 py-2 sm:py-1.5 text-center">{row.persen_total_entry}</td>
                        <td className="px-3 py-2 sm:py-1.5 text-center">{row.sesuai}</td>
                        <td className="px-3 py-2 sm:py-1.5 text-center">{row.tidak_sesuai}</td>
                        <td className="px-4 py-2 sm:py-1.5 text-center">{row.persen_real}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* TABEL 2: REALISASI RATING PER ULP */}
        {/* ========================================== */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] mt-6">
          
          <div className="p-4 sm:p-6 border-b border-[#E2E8F0] bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-t-xl">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <svg className="w-5 h-5 text-[#EC4899]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-black text-[#0F172A] tracking-tight">Realisasi Rating Per ULP</h3>
                <p className="text-[13px] text-[#64748B] font-medium mt-1">Rincian performa entry dan persentase keberhasilan target di tingkat Unit Layanan.</p>
              </div>
            </div>

            {/* 4. PEMANGGILAN EXPORT BUTTON ULP */}
            <ExportOptionsButton 
                targetRef={tableRefULP} 
                fileName="Tabel_Rating_ULP" // Dihapus .png nya agar dinamis 
                buttonText="Export"
                onStateChange={setIsScreenshottingULP}
                className="px-4 py-2 text-xs sm:text-sm w-full sm:w-auto"
            />
          </div>

          {/* AREA SCREENSHOT ULP */}
          <div ref={tableRefULP} className={isScreenshottingULP ? "h-auto bg-white w-max min-w-full pb-4" : "overflow-hidden"}>
            <div className={isScreenshottingULP ? "" : "overflow-x-auto w-full custom-scrollbar"}>
              <table className="w-full text-left text-[11px] sm:text-[12px] whitespace-nowrap">
                <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-4 py-3 text-center font-semibold w-12 sticky left-0 z-10 bg-[#F8FAFC] border-r border-[#E2E8F0]">NO</th>
                    <th className="px-4 py-3 cursor-pointer hover:bg-[#E2E8F0]/50 transition-colors font-semibold" onClick={() => handleSortULP('ulp')}>
                      <div className="flex items-center gap-2">
                        ULP <SortIcon columnKey="ulp" sortConfig={configULP} />
                      </div>
                    </th>
                    <th className="px-3 py-3 text-center font-semibold">Bulan</th>
                    <th className="px-3 py-3 text-center font-semibold">Target</th>
                    <th className="px-3 py-3 text-center font-semibold">Realisasi</th>
                    <th className="px-3 py-3 text-center font-semibold">% Total Entry</th>
                    <th className="px-3 py-3 text-center font-semibold">Sesuai</th>
                    <th className="px-3 py-3 text-center font-semibold">Tidak Sesuai</th>
                    <th className="px-4 py-3 text-center font-semibold">% Real</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] bg-white text-[#334155]">
                  {sortedDataULP.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-8 text-center text-[#64748B] text-sm bg-slate-50/50">
                        Belum ada data ULP yang tersedia atau sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    (isScreenshottingULP ? sortedDataULP : currentItemsULP).map((row, idx) => {
                      const itemNumber = isScreenshottingULP ? idx + 1 : indexOfFirstItem + idx + 1;
                      
                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2 sm:py-1.5 text-center font-bold text-[#94A3B8] sticky left-0 z-10 bg-white border-r border-[#E2E8F0] shadow-[2px_0_4px_-1px_rgba(0,0,0,0.05)]">
                            {itemNumber}
                          </td>
                          <td className="px-4 py-2 sm:py-1.5 font-bold text-[#00A2E9]">{row.ulp || row.unit || '-'}</td>
                          <td className="px-3 py-2 sm:py-1.5 font-bold text-[#334155] text-center">{row.bulan || '-'}</td>
                          <td className="px-3 py-2 sm:py-1.5 text-center">{row.target || '0'}</td>
                          <td className="px-3 py-2 sm:py-1.5 text-center">{row.realisasi || '0'}</td>
                          <td className="px-3 py-2 sm:py-1.5 text-center">{row.persen_total_entry || '-'}</td>
                          <td className="px-3 py-2 sm:py-1.5 text-center">{row.sesuai || '0'}</td>
                          <td className="px-3 py-2 sm:py-1.5 text-center">{row.tidak_sesuai || '0'}</td>
                          <td className="px-4 py-2 sm:py-1.5 text-center">{row.persen_real || '-'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Container */}
          {sortedDataULP.length > 0 && !isScreenshottingULP && (
            <div className="bg-white border-t border-[#E2E8F0] rounded-b-xl overflow-hidden">
              <Pagination
                totalItems={sortedDataULP.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </div>
          )}
        </div>

      </div>
    </main>
  );
}