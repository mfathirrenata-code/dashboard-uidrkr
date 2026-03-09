import React, { useEffect, useState } from 'react';
// Pastikan huruf P besar karena ini komponen React
import Pagination from '@/components/pagination.jsx';

export default function RekapRealisasiUP3() {
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); 
      setError(null);
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/get-sheet-data?type=rekap_up3`);
        
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);

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
        
        <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-[#0F172A] tracking-tight">Rincian Realisasi Transaksi UP3</h2>
            <p className="text-sm text-[#64748B] font-medium mt-1">
              Menampilkan <span className="font-bold text-[#0F172A]">{tableData.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, tableData.length)}</span> dari total <span className="font-bold text-[#0F172A]">{tableData.length}</span> baris data
            </p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase text-xs font-black border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 w-16">No</th>
                <th className="px-6 py-4">Unit AP</th>
                <th className="px-6 py-4 text-center">Bulan</th>
                <th className="px-6 py-4 text-center">Target</th>
                <th className="px-6 py-4 text-center">Real Kom</th>
                <th className="px-6 py-4 text-center border-l border-[#E2E8F0] w-32">% Kom</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {tableData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-[#64748B] font-medium">
                    Belum ada data yang tersedia atau format data tidak sesuai.
                  </td>
                </tr>
              ) : (
                currentItems.map((row, idx) => {
                  const isTargetAchieved = (row.persen || 0) >= 100;
                  
                  return (
                    <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#0F172A]">{indexOfFirstItem + idx + 1}</td>
                      <td className="px-6 py-4 font-bold text-[#0F172A]">{row.unit || '-'}</td>
                      <td className="px-6 py-4 font-bold text-[#475569] text-center">{row.bulan || '-'}</td>
                      <td className="px-6 py-4 text-center font-medium text-[#475569]">{row.target?.toLocaleString() || '0'}</td>
                      <td className="px-6 py-4 text-center font-black text-[#00A2E9]">{row.real?.toLocaleString() || '0'}</td>
                      <td className={`px-6 py-4 text-center text-sm font-black  ${isTargetAchieved ? 'bg-green-50/60 text-green-700' : 'bg-red-50/60 border-red-500 text-red-700'}`}>
                        {row.persen || 0}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {tableData.length > 0 && (
          <Pagination 
            totalItems={tableData.length} 
            itemsPerPage={itemsPerPage} 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
          />
        )}
      </div>
    </main>
  );
}