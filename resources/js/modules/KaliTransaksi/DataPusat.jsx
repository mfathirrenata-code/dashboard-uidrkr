import React, { useEffect, useState, useMemo } from 'react';
import Pagination from '@/components/pagination.jsx';
import TableFilter from '@/components/tablefilter.jsx'; // Pastikan huruf kecil/besarnya sesuai dengan nama file

export default function DataPusat() {
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50; 

  // --- STATE UNTUK FILTER ---
  const [selectedAP, setSelectedAP] = useState([]);
  const [selectedUP, setSelectedUP] = useState([]);
  const [selectedBulan, setSelectedBulan] = useState([]);
  
  // State untuk memastikan hanya ada 1 dropdown filter yang terbuka
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); 
      setError(null);
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/get-sheet-data?type=data_pusat`);
        
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
      // Data lolos jika nilai kolomnya ada di dalam array selected (atau jika array selected kosong, kita anggap lolos semua)
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
        
        {/* BAGIAN HEADER & FILTER */}
        <div className="p-5 border-b border-[#E2E8F0] flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div>
            <h2 className="text-xl font-black text-[#0F172A] tracking-tight">Tabel Data Pusat</h2>
            <p className="text-sm text-[#64748B] font-medium mt-1">
              Menampilkan <span className="font-bold text-[#0F172A]">{filteredData.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, filteredData.length)}</span> dari total <span className="font-bold text-[#0F172A]">{filteredData.length}</span> baris
            </p>
          </div>

          {/* KUMPULAN TOMBOL FILTER */}
          {tableData.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <TableFilter 
                columnName="Unit_AP" 
                uniqueValues={uniqueAP} 
                selectedFilters={selectedAP} 
                isOpen={activeDropdown === 'AP'}
                onToggle={() => setActiveDropdown(activeDropdown === 'AP' ? null : 'AP')}
                onFilterChange={(newFilters) => {
                  setSelectedAP(newFilters);
                  setCurrentPage(1); // Reset halaman ke 1 setiap filter diubah
                }} 
              />
              <TableFilter 
                columnName="Unit_UP" 
                uniqueValues={uniqueUP} 
                selectedFilters={selectedUP} 
                isOpen={activeDropdown === 'UP'}
                onToggle={() => setActiveDropdown(activeDropdown === 'UP' ? null : 'UP')}
                onFilterChange={(newFilters) => {
                  setSelectedUP(newFilters);
                  setCurrentPage(1);
                }} 
              />
              <TableFilter 
                columnName="Bulan" 
                uniqueValues={uniqueBulan} 
                selectedFilters={selectedBulan} 
                isOpen={activeDropdown === 'Bulan'}
                onToggle={() => setActiveDropdown(activeDropdown === 'Bulan' ? null : 'Bulan')}
                onFilterChange={(newFilters) => {
                  setSelectedBulan(newFilters);
                  setCurrentPage(1);
                }} 
              />
            </div>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase text-xs font-black border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 w-16 text-center">No</th>
                {headers.map((headerKey, index) => (
                  <th key={index} className="px-6 py-4 select-none">
                    {headerKey.replace(/_/g, ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={headers.length + 1} className="px-6 py-12 text-center text-[#64748B] font-medium">
                    {tableData.length === 0 
                      ? "Belum ada data yang tersedia di sheet ini." 
                      : "Tidak ada data yang cocok dengan filter yang dipilih."}
                  </td>
                </tr>
              ) : (
                currentItems.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-6 py-4 font-bold text-[#0F172A] text-center">
                      {indexOfFirstItem + idx + 1}
                    </td>
                    
                    {headers.map((headerKey, cellIdx) => (
                      <td key={cellIdx} className="px-6 py-4 text-[#475569]">
                        {headerKey === 'transaksi' && !isNaN(row[headerKey])
                          ? Number(row[headerKey]).toLocaleString('id-ID')
                          : row[headerKey] ?? '-'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredData.length > 0 && (
          <Pagination 
            totalItems={filteredData.length} 
            itemsPerPage={itemsPerPage} 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
          />
        )}
      </div>
    </main>
  );
}