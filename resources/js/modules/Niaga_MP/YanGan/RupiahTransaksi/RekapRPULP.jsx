import React, { useEffect, useState, useMemo } from 'react';
import Pagination from '@/components/shared/pagination.jsx';
import TableFilter from '@/components/shared/TableFilter.jsx';
import { useSortableData, SortIcon } from "@/utils/sorting.jsx";

export default function RekapRPULP() {
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const [selectedFilters, setSelectedFilters] = useState([]);
  
  // PERBAIKAN: Tambahkan state ini untuk mengontrol buka-tutup TableFilter
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/rupiah/real-ulp`);

        if (!response.ok) {
          throw new Error(`Server Error: ${response.status} - Gagal mengambil data tabel`);
        }

        const data = await response.json();
        const actualData = Array.isArray(data) ? data : (data.data || data.tabelReal || data.tabelULP || []);

        if (actualData && actualData.length > 0) {
          setTableData(actualData);
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

  const headers = useMemo(() => {
    if (tableData.length === 0) return [];
    return Object.keys(tableData[0]).filter(key => key.toLowerCase() !== 'no');
  }, [tableData]);

  const filterColumnKey = useMemo(() => {
    if (headers.length === 0) return null;
    return headers.find(h => h.toLowerCase().includes('unit')) || headers[1] || headers[0];
  }, [headers]);

  const uniqueValues = useMemo(() => {
    if (!filterColumnKey || tableData.length === 0) return [];
    const values = [...new Set(tableData.map(item => item[filterColumnKey]))].filter(Boolean);
    return values.sort();
  }, [tableData, filterColumnKey]);

  useEffect(() => {
    if (uniqueValues.length > 0 && selectedFilters.length === 0) {
      setSelectedFilters(uniqueValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uniqueValues]);

  const filteredTableData = useMemo(() => {
    if (!filterColumnKey) return tableData;
    return tableData.filter(row => selectedFilters.includes(row[filterColumnKey]));
  }, [tableData, selectedFilters, filterColumnKey]);

  const { items: sortedData, requestSort, sortConfig } = useSortableData(filteredTableData);

  const handleSort = (key) => {
    requestSort(key); 
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setSelectedFilters(newFilters);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  console.log("filterColumnKey:", filterColumnKey);
console.log("selectedFilters:", selectedFilters);
console.log("uniqueValues:", uniqueValues);
console.log("filtered:", filteredTableData.length);

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
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h3 className="text-xl font-black text-red-600 mb-2">Gagal Memuat Data</h3>
          <p className="text-red-500 max-w-md">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">

        <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <h2 className="text-xl font-black text-[#0F172A] tracking-tight">Data Keseluruhan Real RP ULP</h2>
            <p className="text-sm text-[#64748B] font-medium mt-1">
              Menampilkan <span className="font-bold text-[#0F172A]">{sortedData.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, sortedData.length)}</span> dari total <span className="font-bold text-[#0F172A]">{sortedData.length}</span> baris data
            </p>
          </div>

          {filterColumnKey && (
            <TableFilter 
              columnName={filterColumnKey}
              uniqueValues={uniqueValues}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
              // PERBAIKAN: Lemparkan state dan fungsi toggle ke komponen
              isOpen={isFilterOpen}
              onToggle={() => setIsFilterOpen(!isFilterOpen)}
            />
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase text-xs font-black border-b border-[#E2E8F0]">
              <tr>
                <th className="px-3 py-3 w-12 text-center">No</th>
                {headers.map((headerKey, index) => {
                  const normalizedKey = headerKey.toLowerCase().replace(/_/g, ' ').trim();
                  const isSortableColumn = (normalizedKey.includes('%') || normalizedKey.includes('persen')) && normalizedKey.includes('kom');

                  return (
                    <th
                      key={index}
                      className={`px-3 py-3 select-none ${isSortableColumn ? 'cursor-pointer hover:text-[#00A2E9] group text-center' : ''}`}
                      onClick={isSortableColumn ? () => handleSort(headerKey) : undefined}
                    >
                      <div className={`flex items-center ${isSortableColumn ? 'justify-center' : ''}`}>
                        {headerKey.replace(/_/g, ' ')}
                        {isSortableColumn && <SortIcon columnKey={headerKey} sortConfig={sortConfig} />}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={headers.length + 1} className="px-3 py-12 text-center text-[#64748B] font-medium">
                    {selectedFilters.length === 0 
                      ? "Silakan centang filter unit untuk menampilkan data." 
                      : "Belum ada data yang tersedia."}
                  </td>
                </tr>
              ) : (
                currentItems.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-3 py-3 font-bold text-[#0F172A] text-center">
                      {indexOfFirstItem + idx + 1}
                    </td>
                    {headers.map((headerKey, cellIdx) => {
                      const normalizedKey = headerKey.toLowerCase().replace(/_/g, ' ').trim();
                      const isKomColumn = (normalizedKey.includes('%') || normalizedKey.includes('persen')) && normalizedKey.includes('kom');
                      
                      const rawValue = row[headerKey];
                      const stringValue = String(rawValue ?? '').replace(',', '.').replace('%', '').trim();
                      const numericValue = Number(stringValue);
                      const isValidNumber = stringValue !== '' && !isNaN(numericValue);

                      let textColorClass = "text-[#475569]"; 

                      if (isKomColumn) {
                        textColorClass = "text-[#475569] text-center"; 
                        if (isValidNumber) {
                          if (numericValue >= 100) {
                            textColorClass = "bg-green-50/60 text-center text-green-700 font-black"; 
                          } else {
                            textColorClass = "bg-red-100 text-center text-red-700 font-black";
                          }
                        }
                      }

                      return (
                        <td key={cellIdx} className={`px-3 py-3 ${textColorClass}`}>
                          {(headerKey.includes('target') || headerKey.includes('real')) && isValidNumber
                            ? numericValue.toLocaleString('id-ID')
                            : (headerKey.includes('persen') || isKomColumn) && isValidNumber
                              ? `${numericValue.toFixed(2)}%`
                              : rawValue ?? '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))
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