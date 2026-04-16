import React, { useEffect, useState, useMemo, useRef } from 'react';
import Pagination from '@/components/shared/pagination.jsx';
import TableFilter from '@/components/shared/tablefilter.jsx';
import { useSortableData, SortIcon } from "@/utils/sorting.jsx";

// 1. Import ExportOptionsButton
import ExportOptionsButton from '@/components/shared/ExportOptionsButton';

export default function MonitoringSPKLU() {
    const [tableData, setTableData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 30;

    // ==========================================
    // STATE UNTUK FILTER
    // ==========================================
    const [selectedUP3, setSelectedUP3] = useState([]);
    const [selectedULP, setSelectedULP] = useState([]);
    const [selectedTahun, setSelectedTahun] = useState([]);
    const [selectedRekap, setSelectedRekap] = useState([]); // State untuk REKAP

    // REF & STATE UNTUK SCREENSHOT/EXPORT
    const tableRef = useRef(null);
    const [isScreenshotting, setIsScreenshotting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/spklu/monitoring`);

                if (!response.ok) {
                    throw new Error(`Server Error: ${response.status} - Gagal mengambil data tabel`);
                }

                const data = await response.json();
                const actualData = Array.isArray(data) ? data : (data.data || []);

                if (actualData && actualData.length > 0) {
                    setTableData(actualData);

                    const allUP3 = [...new Set(actualData.map(item => item.up3))].filter(Boolean);
                    const allULP = [...new Set(actualData.map(item => item.ulp))].filter(Boolean);
                    const allTahun = [...new Set(actualData.map(item => String(item.tahun)))].filter(Boolean);
                    const allRekap = [...new Set(actualData.map(item => item.rekap))].filter(Boolean); // Ambil REKAP unik

                    const sortedTahun = [...allTahun].sort().reverse();
                    const latestTahun = sortedTahun.length > 0 ? [sortedTahun[0]] : [];

                    setSelectedUP3(allUP3);
                    setSelectedULP(allULP);
                    setSelectedRekap(allRekap); // Default centang semua

                    // Set state filter tahun HANYA ke tahun terbaru
                    setSelectedTahun(latestTahun);
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

    const uniqueUP3 = useMemo(() => [...new Set(tableData.map(item => item.up3))].filter(Boolean).sort(), [tableData]);
    const uniqueULP = useMemo(() => [...new Set(tableData.map(item => item.ulp))].filter(Boolean).sort(), [tableData]);
    const uniqueTahun = useMemo(() => [...new Set(tableData.map(item => String(item.tahun)))].filter(Boolean).sort().reverse(), [tableData]);
    const uniqueRekap = useMemo(() => [...new Set(tableData.map(item => item.rekap))].filter(Boolean).sort(), [tableData]); // Memoize REKAP unik

    const filteredData = useMemo(() => {
        return tableData.filter(row => {
            const matchUP3 = selectedUP3.length === 0 || selectedUP3.includes(row.up3);
            const matchULP = selectedULP.length === 0 || selectedULP.includes(row.ulp);
            const matchTahun = selectedTahun.length === 0 || selectedTahun.includes(String(row.tahun));
            const matchRekap = selectedRekap.length === 0 || selectedRekap.includes(row.rekap); // Pengecekan REKAP

            return matchUP3 && matchULP && matchTahun && matchRekap; // Digabungkan
        });
    }, [tableData, selectedUP3, selectedULP, selectedTahun, selectedRekap]); // Dependency ditambah

    const { items: sortedData, requestSort, sortConfig } = useSortableData(filteredData);

    const handleSort = (key) => {
        requestSort(key);
        setCurrentPage(1);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

    // ==========================================
    // LOGIKA WARNA KOTAK ANGKA
    // ==========================================
    const getCellClasses = (value) => {
        const num = parseFloat(value);
        if (isNaN(num) || num === 0) return 'bg-[#EF4444] text-white shadow-sm';
        return 'bg-[#22C55E] text-white shadow-sm';
    };

    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

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
                    <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">
                        Coba Lagi
                    </button>
                </div>
            </main>
        );
    }

    // Persiapkan array filter gabungan (hanya render jika ada data unik)
    const combinedFilters = [
        ...(uniqueULP.length > 0 ? [{
            columnName: "ULP",
            uniqueValues: uniqueULP,
            selectedFilters: selectedULP,
            onFilterChange: (newFilters) => { setSelectedULP(newFilters); setCurrentPage(1); },
            isDatePicker: false
        }] : []),
        ...(uniqueTahun.length > 0 ? [{
            columnName: "Tahun",
            uniqueValues: uniqueTahun,
            selectedFilters: selectedTahun,
            onFilterChange: (newFilters) => { setSelectedTahun(newFilters); setCurrentPage(1); },
            isDatePicker: false
        }] : []),
        ...(uniqueRekap.length > 0 ? [{
            columnName: "REKAP",
            uniqueValues: uniqueRekap,
            selectedFilters: selectedRekap,
            onFilterChange: (newFilters) => { setSelectedRekap(newFilters); setCurrentPage(1); },
            isDatePicker: false
        }] : [])
    ];

    return (
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">

            <div ref={tableRef} className={`bg-white rounded-2xl shadow-sm border border-[#E2E8F0] border-t-[3px] border-t-[#00A2E9] ${isScreenshotting ? "h-auto w-max min-w-full pb-4" : "overflow-hidden"}`}>

                <div className="p-4 sm:p-5 border-b border-[#E2E8F0] bg-white flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative z-20">
                    <div>
                        <h2 className="text-2xl font-black text-[#0F172A] tracking-tight">Data Keseluruhan Real ULP PST</h2>
                        <p className="text-[15px] text-[#64748B] mt-1">
                            Menampilkan <span className="font-bold text-[#0F172A]">{sortedData.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, sortedData.length)}</span> dari total <span className="font-bold text-[#0F172A]">{sortedData.length}</span> baris data
                        </p>
                    </div>

                    {/* KUMPULAN TOMBOL FILTER & EXPORT */}
                    <div className="flex flex-wrap items-center gap-2">
                        
                        {/* 2. Pemanggilan TableFilter GABUNGAN */}
                        {combinedFilters.length > 0 && (
                            <TableFilter
                                alignRight={true} // Agar dropdown tidak terpotong layar sebelah kanan
                                buttonText="Filter Data"
                                compactMode={false} // Agar tinggi selaras dengan tombol Export
                                filters={combinedFilters}
                            />
                        )}

                        <div className="ml-1">
                            {/* 3. Pemanggilan ExportOptionsButton */}
                            <ExportOptionsButton
                                targetRef={tableRef}
                                fileName="Monitoring_SPKLU_Transaksi"
                                buttonText="Export"
                                onStateChange={setIsScreenshotting}
                                className="px-4 py-[7px] text-[13px] rounded-full"
                            />
                        </div>
                    </div>
                </div>

                <div className={isScreenshotting ? "" : "overflow-x-auto w-full custom-scrollbar relative z-10"}>
                    <table className="w-full text-left text-[11px] sm:text-[12px] whitespace-nowrap">
                        <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0]">
                            <tr>
                                <th className="px-4 py-3 text-center font-semibold w-12 sticky left-0 z-10 bg-[#F8FAFC] border-r border-[#E2E8F0]">NO</th>
                                <th className="px-4 py-3 cursor-pointer hover:bg-[#E2E8F0]/50 transition-colors font-semibold" onClick={() => handleSort('ulp')}>
                                    <div className="flex items-center gap-2">ULP <SortIcon columnKey="ulp" sortConfig={sortConfig} /></div>
                                </th>
                                <th className="px-4 py-3 font-semibold w-64">NAMA SPKLU</th>
                                <th className="px-3 py-3 text-center font-semibold">TAHUN</th>
                                {months.map(m => (
                                    <th key={m} className="px-2 py-3 text-center font-semibold w-12 uppercase">{m}</th>
                                ))}
                                <th className="px-4 py-3 text-center font-black text-[#22C55E]">TOTAL</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-[#F1F5F9] bg-white text-[#334155]">
                            {sortedData.length === 0 ? (
                                <tr>
                                    <td colSpan="17" className="px-4 py-12 text-center text-[#64748B] text-sm bg-slate-50/50">Tidak ada data SPKLU yang sesuai filter.</td>
                                </tr>
                            ) : (
                                (isScreenshotting ? sortedData : currentItems).map((row, idx) => {
                                    const rowNumber = isScreenshotting ? idx + 1 : indexOfFirstItem + idx + 1;
                                    return (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-4 py-2 sm:py-1.5 text-center font-bold text-[#94A3B8] sticky left-0 z-10 bg-white group-hover:bg-slate-50 border-r border-[#E2E8F0] shadow-[2px_0_4px_-1px_rgba(0,0,0,0.05)]">
                                                {rowNumber}
                                            </td>
                                            <td className="px-4 py-2 sm:py-1.5 font-bold text-[#00A2E9]">{row.ulp || '-'}</td>
                                            <td className="px-4 py-2 sm:py-1.5 font-bold text-[#0F172A] truncate max-w-[200px]" title={row.nama_spklu}>{row.nama_spklu || '-'}</td>
                                            <td className="px-3 py-2 sm:py-1.5 font-bold text-[#64748B] text-center">{row.tahun || '-'}</td>

                                            {/* DATA BULAN DENGAN PEMBULATAN & UKURAN FONT LEBIH KECIL */}
                                            {months.map(m => {
                                                const rawVal = row[m] ?? 0;
                                                const displayVal = !isNaN(parseFloat(rawVal)) ? Math.round(parseFloat(rawVal)) : rawVal;
                                                return (
                                                    <td key={m} className="px-0.5 py-1.5 align-middle text-center">
                                                        <div className={`mx-auto flex items-center justify-center w-8 h-7 rounded-md font-bold text-[9px] leading-none whitespace-nowrap transition-transform hover:scale-110 ${getCellClasses(rawVal)}`}>
                                                            {displayVal}
                                                        </div>
                                                    </td>
                                                );
                                            })}

                                            <td className={`px-4 py-2 sm:py-3 text-center font-black bg-slate-50/50 transition-colors ${(!row.total || parseFloat(row.total) === 0) ? 'text-[#EF4444]' : 'text-[#22C55E]'
                                                }`}>
                                                {row.total?.toLocaleString('id-ID') || '0'}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {sortedData.length > 0 && !isScreenshotting && (
                    <div className="bg-white border-t border-[#E2E8F0] rounded-b-xl overflow-hidden">
                        <Pagination totalItems={sortedData.length} itemsPerPage={itemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
                    </div>
                )}
            </div>
        </main>
    );
}