import React, { useEffect, useState, useMemo, useRef } from 'react';
import Pagination from '@/components/shared/pagination.jsx';
import TableFilter from '@/components/shared/TableFilter.jsx';
import { useSortableData, SortIcon } from "@/utils/sorting.jsx"; 
import ExportOptionsButton from '@/components/shared/ExportOptionsButton'; 

export default function RealisasiUP3() {
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30; // Kamu bisa naikin angka ini misal ke 40/50 karena barisnya sudah lebih tipis

  // ==========================================
  // STATE UNTUK FILTER (UNIT AP & BULAN)
  // ==========================================
  const [selectedUnitFilters, setSelectedUnitFilters] = useState([]);
  const [selectedBulanFilters, setSelectedBulanFilters] = useState([]);

  // REF & STATE UNTUK SCREENSHOT
  const tableRef = useRef(null);
  const [isScreenshotting, setIsScreenshotting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); 
      setError(null);
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/transaksi/real-up3`);
        
        if (!response.ok) {
          throw new Error(`Server Error: ${response.status} - Gagal mengambil data tabel`);
        }
        
        const data = await response.json();
        
        if (data && !data.error) {
          if (Array.isArray(data.tabelUP3)) {
            setTableData(data.tabelUP3);
          } else if (Array.isArray(data)) {
            setTableData(data);
          } else {
            setTableData([]); 
          }
        } else {
          throw new Error(data.error || "Data tabel tidak ditemukan di server");
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
  // MENDAPATKAN NILAI UNIK UNTUK LIST FILTER
  // ==========================================
  const uniqueUnitValues = useMemo(() => {
    if (tableData.length === 0) return [];
    return [...new Set(tableData.map(item => item.unit))].filter(Boolean).sort();
  }, [tableData]);

  const uniqueBulanValues = useMemo(() => {
    if (tableData.length === 0) return [];
    const monthOrder = { "JAN": 1, "FEB": 2, "MAR": 3, "APR": 4, "MAY": 5, "JUN": 6, "JUL": 7, "AUG": 8, "SEP": 9, "OCT": 10, "NOV": 11, "DEC": 12 };
    return [...new Set(tableData.map(item => item.bulan))].filter(Boolean).sort((a, b) => {
      const numA = monthOrder[a.toUpperCase()] || 99;
      const numB = monthOrder[b.toUpperCase()] || 99;
      return numA - numB;
    });
  }, [tableData]);

  // Set default filter dicentang semua
  useEffect(() => {
    if (uniqueUnitValues.length > 0 && selectedUnitFilters.length === 0) {
      setSelectedUnitFilters(uniqueUnitValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueUnitValues]);

  useEffect(() => {
    if (uniqueBulanValues.length > 0 && selectedBulanFilters.length === 0) {
      setSelectedBulanFilters(uniqueBulanValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueBulanValues]);

  // ==========================================
  // LOGIKA GABUNGAN FILTER DATA
  // ==========================================
  const filteredTableData = useMemo(() => {
    return tableData.filter(row => {
      const matchUnit = selectedUnitFilters.includes(row.unit);
      const matchBulan = selectedBulanFilters.includes(row.bulan);
      return matchUnit && matchBulan;
    });
  }, [tableData, selectedUnitFilters, selectedBulanFilters]);

  const { items: sortedData, requestSort, sortConfig } = useSortableData(filteredTableData);

  const handleSort = (key) => {
    requestSort(key);
    setCurrentPage(1); 
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  // ==========================================
  // KONFIGURASI FILTER BARU (MULTIPLE FILTERS)
  // ==========================================
  const filterConfigs = [
    {
      columnName: "Unit AP",
      uniqueValues: uniqueUnitValues,
      selectedFilters: selectedUnitFilters,
      onFilterChange: (newVals) => { 
        setSelectedUnitFilters(newVals); 
        setCurrentPage(1); 
      },
      isDatePicker: false
    },
    {
      columnName: "Bulan",
      uniqueValues: uniqueBulanValues,
      selectedFilters: selectedBulanFilters,
      onFilterChange: (newVals) => { 
        setSelectedBulanFilters(newVals); 
        setCurrentPage(1); 
      },
      isDatePicker: false
    }
  ];

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
    // Padding kontainer utama dikurangi agar tabel lebih lebar
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-2 md:p-4 animate-in fade-in duration-500">
      <div 
        ref={tableRef} 
        className={`bg-white rounded-xl shadow-sm border border-[#E2E8F0] border-t-[3px] border-t-[#00A2E9] ${isScreenshotting ? "h-auto pb-4" : "overflow-hidden"}`}
      >
        
        {/* Padding header tabel dirapatkan (p-5 jadi p-3) */}
        <div className="p-3 border-b border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-lg font-black text-[#0F172A] tracking-tight">Rincian Realisasi Transaksi UP3</h2>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">
              Menampilkan <span className="font-bold text-[#0F172A]">{sortedData.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, sortedData.length)}</span> dari total <span className="font-bold text-[#0F172A]">{sortedData.length}</span> baris
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 relative z-[60]">
            {(uniqueUnitValues.length > 0 || uniqueBulanValues.length > 0) && (
              <TableFilter 
                filters={filterConfigs} 
                buttonText="Filter Data"
              />
            )}
            <div className="ml-1">
              <ExportOptionsButton 
                targetRef={tableRef} 
                fileName="Tabel_Realisasi_UP3" 
                buttonText="Export"
                onStateChange={setIsScreenshotting}
                className="px-3 py-2 text-xs rounded-md"
              />
            </div>
          </div>
        </div>
        
        <div className={isScreenshotting ? "" : "overflow-x-auto"}>
          {/* Ukuran font tabel diperkecil jadi text-[11px] */}
          <table className="w-full text-left text-[11px] whitespace-nowrap">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase text-[10px] font-black border-b border-[#E2E8F0]">
              <tr>
                {/* Padding TH dirapatkan (py-2 jadi py-1.5) */}
                <th className="px-2 py-1.5 w-10 text-center">No</th>
                
                <th className="px-2 py-1.5 cursor-pointer hover:text-[#00A2E9] select-none" onClick={() => handleSort('unit')}>
                  <div className="flex items-center">
                    Unit AP
                    <SortIcon columnKey="unit" sortConfig={sortConfig} />
                  </div>
                </th>
                
                <th className="px-2 py-1.5 text-center">Bulan</th>
                <th className="px-2 py-1.5 text-center">Target</th>
                <th className="px-2 py-1.5 text-center">Real Kom</th>

                <th className="px-2 py-1.5 text-center w-24 cursor-pointer group hover:bg-slate-100 select-none" onClick={() => handleSort('persen')}>
                  <div className="flex items-center justify-center">
                    % Kom
                    <SortIcon columnKey="persen" sortConfig={sortConfig} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] bg-white">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-2 py-6 text-center text-[#64748B] font-medium">
                    {selectedUnitFilters.length === 0 || selectedBulanFilters.length === 0 
                      ? "Silakan centang filter unit dan bulan untuk menampilkan data." 
                      : "Belum ada data yang tersedia untuk kombinasi filter tersebut."}
                  </td>
                </tr>
              ) : (
                (isScreenshotting ? sortedData : currentItems).map((row, idx) => {
                  const isTargetAchieved = (row.persen || 0) >= 100;
                  const rowNumber = isScreenshotting ? idx + 1 : indexOfFirstItem + idx + 1;
                  
                  return (
                    <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-2 py-2 font-bold text-[#0F172A] text-center">{rowNumber}</td>
                      <td className="px-2 py-2 text-[#0F172A]">{row.unit || '-'}</td>
                      <td className="px-2 py-2 text-[#475569] text-center">{row.bulan || '-'}</td>
                      <td className="px-2 py-2 text-center text-[#475569]">{row.target?.toLocaleString() || '0'}</td>
                      <td className="px-2 py-2 text-center text-[#475569]">{row.real?.toLocaleString() || '0'}</td>
                      <td className={`px-2 py-2 text-center text-[11px] font-black ${isTargetAchieved ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {row.persen || 0}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {sortedData.length > 0 && !isScreenshotting && (
          <div className="py-1">
            <Pagination 
              totalItems={sortedData.length} 
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