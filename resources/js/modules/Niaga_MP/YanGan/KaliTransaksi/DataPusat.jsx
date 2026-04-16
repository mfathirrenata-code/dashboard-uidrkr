import React, { useEffect, useState, useMemo, useRef } from 'react';
import Pagination from '@/components/shared/pagination.jsx';
import TableFilter from '@/components/shared/tablefilter.jsx';
// 1. UBAH IMPORT DI SINI
import ExportOptionsButton from '@/components/shared/ExportOptionsButton';

export default function DataPusat() {
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30; // Ditingkatkan ke 40 biar muat lebih banyak karena baris lebih padat

  // --- STATE UNTUK FILTER ---
  const [selectedAP, setSelectedAP] = useState([]);
  const [selectedUP, setSelectedUP] = useState([]);
  const [selectedBulan, setSelectedBulan] = useState([]);
  
  // REF & STATE UNTUK SCREENSHOT
  const tableRef = useRef(null);
  const [isScreenshotting, setIsScreenshotting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); 
      setError(null);
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/transaksi/data-pusat`);
        
        if (!response.ok) {
          throw new Error(`Server Error: ${response.status} - Gagal mengambil data tabel`);
        }
        
        const data = await response.json();
        const actualData = Array.isArray(data) ? data : (data.data || []);
        
        if (actualData && actualData.length > 0) {
          setTableData(actualData);
          
          // Inisialisasi filter: Pilih semua nilai secara default
          const allAP = [...new Set(actualData.map(item => item.nama_unit_ap))].filter(Boolean);
          const allUP = [...new Set(actualData.map(item => item.nama_unit_up))].filter(Boolean);
          const allBulan = [...new Set(actualData.map(item => item.bulan))].filter(Boolean);
          
          setSelectedAP(allAP);
          setSelectedUP(allUP);
          setSelectedBulan(allBulan);
        } else {
          setTableData([]); 
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

  // --- LOGIKA MENGAMBIL UNIQUE VALUES UNTUK DROPDOWN FILTER ---
  const uniqueAP = useMemo(() => [...new Set(tableData.map(item => item.nama_unit_ap))].filter(Boolean), [tableData]);
  const uniqueUP = useMemo(() => [...new Set(tableData.map(item => item.nama_unit_up))].filter(Boolean), [tableData]);
  const uniqueBulan = useMemo(() => [...new Set(tableData.map(item => item.bulan))].filter(Boolean), [tableData]);

  // --- APLIKASIKAN FILTER KE DATA ---
  const filteredData = useMemo(() => {
    return tableData.filter(item => {
      const matchAP = selectedAP.length === 0 || selectedAP.includes(item.nama_unit_ap);
      const matchUP = selectedUP.length === 0 || selectedUP.includes(item.nama_unit_up);
      const matchBulan = selectedBulan.length === 0 || selectedBulan.includes(item.bulan);
      
      return matchAP && matchUP && matchBulan;
    });
  }, [tableData, selectedAP, selectedUP, selectedBulan]);

  // Logika Pagination menggunakan data yang sudah difilter
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Ambil Header dinamis
  const headers = useMemo(() => {
    if (tableData.length === 0) return [];
    return Object.keys(tableData[0]).filter(key => key.toLowerCase() !== 'no');
  }, [tableData]);

  // ==========================================
  // KONFIGURASI FILTER BARU (MULTIPLE FILTERS)
  // ==========================================
  const filterConfigs = useMemo(() => {
    const configs = [];
    if (uniqueAP.length > 0) {
      configs.push({
        columnName: "Filter AP",
        uniqueValues: uniqueAP,
        selectedFilters: selectedAP,
        onFilterChange: (newVals) => { 
          setSelectedAP(newVals); 
          setCurrentPage(1); 
        },
        isDatePicker: false
      });
    }
    if (uniqueUP.length > 0) {
      configs.push({
        columnName: "Filter UP",
        uniqueValues: uniqueUP,
        selectedFilters: selectedUP,
        onFilterChange: (newVals) => { 
          setSelectedUP(newVals); 
          setCurrentPage(1); 
        },
        isDatePicker: false
      });
    }
    if (uniqueBulan.length > 0) {
      configs.push({
        columnName: "Filter Bulan",
        uniqueValues: uniqueBulan,
        selectedFilters: selectedBulan,
        onFilterChange: (newVals) => { 
          setSelectedBulan(newVals); 
          setCurrentPage(1); 
        },
        isDatePicker: false
      });
    }
    return configs;
  }, [uniqueAP, selectedAP, uniqueUP, selectedUP, uniqueBulan, selectedBulan]);


  if (isLoading) {
    return (
      <main className="flex-1 bg-[#F8FAFC] p-4 flex flex-col items-center justify-center min-h-[80vh]">
        <svg className="animate-spin h-8 w-8 text-[#00A2E9] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-xs text-[#64748B] font-medium mt-1">Mengambil informasi terbaru dari server...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 bg-[#F8FAFC] p-4">
        <div className="flex flex-col items-center justify-center py-12 bg-red-50 rounded-xl border border-red-200 text-center px-4">
          <div className="bg-red-100 p-2 rounded-full mb-3">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h3 className="text-lg font-black text-red-600 mb-1">Gagal Memuat Data</h3>
          <p className="text-sm text-red-500 max-w-md">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-1.5 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </main>
    );
  }

  return (
    // Padding luar diubah jadi p-2 md:p-4 supaya tabel lebih mentok kiri-kanan
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-2 md:p-4 animate-in fade-in duration-500">
      
      {/* 1 CONTAINER UTAMA SAJA - Ditempel ref untuk screenshot */}
      <div ref={tableRef} className={`bg-white rounded-xl shadow-sm border border-[#E2E8F0] border-t-[3px] border-t-[#00A2E9] ${isScreenshotting ? "h-auto pb-4" : "overflow-hidden"}`}>
        
        {/* BAGIAN HEADER & FILTER: padding diperkecil ke p-3, gap-3 */}
        <div className="p-3 border-b border-[#E2E8F0] flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 relative z-10">
          <div>
            <h2 className="text-lg font-black text-[#0F172A] tracking-tight">Tabel Data Pusat</h2>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">
              Menampilkan <span className="font-bold text-[#0F172A]">{filteredData.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, filteredData.length)}</span> dari total <span className="font-bold text-[#0F172A]">{filteredData.length}</span> baris
            </p>
          </div>

          {/* KUMPULAN TOMBOL FILTER & SCREENSHOT */}
          {tableData.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 relative z-[60]">
              
              {/* PEMANGGILAN KOMPONEN FILTER BARU */}
              {filterConfigs.length > 0 && (
                <TableFilter 
                  filters={filterConfigs} 
                  buttonText="Filter Data"
                />
              )}

              {/* TOMBOL SCREENSHOT DI KANAN FILTER */}
              <div className="ml-1">
                {/* 2. UBAH PEMANGGILAN KOMPONEN DI SINI */}
                <ExportOptionsButton 
                  targetRef={tableRef} 
                  fileName="Tabel_Data_Pusat" 
                  buttonText="Export"
                  onStateChange={setIsScreenshotting}
                  className="px-3 py-1.5 text-xs rounded-md" // Tombol diperkecil
                />
              </div>
            </div>
          )}
        </div>
        
        {/* TABEL LANGSUNG NYATU KE CONTAINER UTAMA */}
        <div className={isScreenshotting ? "bg-white w-max min-w-full" : "overflow-x-auto"}>
          <table className="w-full text-left text-[11px] whitespace-nowrap">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase text-[10px] font-black border-b border-[#E2E8F0]">
              <tr>
                {/* py-2 jadi py-1.5 agar lebih padat */}
                <th className="px-2 py-1.5 w-10 text-center">No</th>
                {headers.map((headerKey, index) => (
                  <th key={index} className="px-2 py-1.5 select-none">
                    {headerKey.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] bg-white">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={headers.length + 1} className="px-2 py-6 text-center text-[#64748B] font-medium">
                    {tableData.length === 0 
                      ? "Belum ada data yang tersedia di sheet ini." 
                      : "Tidak ada data yang cocok dengan filter yang dipilih."}
                  </td>
                </tr>
              ) : (
                // Saat screenshot berlangsung, tampilkan semua hasil filter tanpa dipotong paginasi
                (isScreenshotting ? filteredData : currentItems).map((row, idx) => {
                  // Sesuaikan nomor urut jika sedang difoto (tampilkan semua data) atau paginasi biasa
                  const rowNumber = isScreenshotting ? idx + 1 : indexOfFirstItem + idx + 1;
                  
                  return (
                    <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                      {/* py-2 jadi py-1 agar baris lebih tipis (zoom out effect) */}
                      <td className="px-2 py-1 font-bold text-[#0F172A] text-center">
                        {rowNumber}
                      </td>
                      
                      {headers.map((headerKey, cellIdx) => (
                        <td key={cellIdx} className="px-2 py-1 text-[#475569]">
                          {headerKey === 'transaksi' && !isNaN(row[headerKey])
                            ? Number(row[headerKey]).toLocaleString('id-ID')
                            : row[headerKey] ?? '-'}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginasi dibungkus padding agar pas saat resolusi padat */}
        {filteredData.length > 0 && !isScreenshotting && (
          <div className="py-1">
            <Pagination 
              totalItems={filteredData.length} 
              itemsPerPage={itemsPerPage} 
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage} 
            />
          </div>
        )}
      </div>
    </main>
  );
}