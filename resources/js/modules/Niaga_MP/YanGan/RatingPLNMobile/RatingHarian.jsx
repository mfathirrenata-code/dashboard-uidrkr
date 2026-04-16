import React, { useState, useEffect, useRef } from 'react';

// 1. Sesuaikan Import Component Baru
import ExportOptionsButton from '@/components/shared/ExportOptionsButton';
import TableFilter from '@/components/shared/tablefilter';

export default function RatingHarian() {
    const [tableData, setTableData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // 2. State bulan diubah menjadi Array agar sesuai dengan TableFilter
    const [selectedBulanFilters, setSelectedBulanFilters] = useState([]);
    const [viewRange, setViewRange] = useState('1-15');
    
    const tableRef = useRef(null);
    const [isScreenshotting, setIsScreenshotting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/rating/harian`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                const rawData = result.tabelHarian || [];

                // MAPPING DATA SESUAI JSON
                const normalizedData = rawData.map(row => {
                    return {
                        no: row.ui,
                        ui: row.up,
                        up: row.ul,
                        ul: row.tgl_1,
                        bulan: row.tgl_3,

                        tgl_1: row.tgl_4 || "0",
                        tgl_2: row.tgl_5 || "0",
                        tgl_3: row.tgl_6 || "0",
                        tgl_4: row.tgl_7 || "0",
                        tgl_5: row.tgl_8 || "0",
                        tgl_6: row.tgl_9 || "0",
                        tgl_7: row.tgl_10 || "0",
                        tgl_8: row.tgl_11 || "0",
                        tgl_9: row.tgl_12 || "0",
                        tgl_10: row.tgl_13 || "0",
                        tgl_11: row.tgl_14 || "0",
                        tgl_12: row.tgl_15 || "0",
                        tgl_13: row.tgl_16 || "0",
                        tgl_14: row.tgl_17 || "0",
                        tgl_15: row.tgl_18 || "0",

                        tgl_16: row.tgl_19 || "0",
                        tgl_17: row.tgl_20 || "0",
                        tgl_18: row.tgl_21 || "0",
                        tgl_19: row.tgl_22 || "0",
                        tgl_20: row.tgl_23 || "0",
                        tgl_21: row.tgl_24 || "0",
                        tgl_22: row.tgl_25 || "0",
                        tgl_23: row.tgl_26 || "0",
                        tgl_24: row.tgl_27 || "0",
                        tgl_25: row.tgl_28 || "0",
                        tgl_26: row.tgl_29 || "0",
                        tgl_27: row.tgl_30 || "0",
                        tgl_28: row.tgl_31 || "0",
                        tgl_29: row.tgl_32 || "0",
                        tgl_30: row.tgl_33 || "0",
                        tgl_31: row.tgl_34 || "0",
                    };
                });

                setTableData(normalizedData);

                const savedBulan = localStorage.getItem('savedBulan_rating');
                const availableMonthsFromData = [...new Set(normalizedData.map(row => row.bulan ? row.bulan.toUpperCase() : ''))].filter(Boolean);

                if (savedBulan && availableMonthsFromData.includes(savedBulan)) {
                    setSelectedBulanFilters([savedBulan]); 
                } else if (normalizedData.length > 0 && normalizedData[0].bulan) {
                    setSelectedBulanFilters([normalizedData[0].bulan.toUpperCase()]);
                }

            } catch (err) {
                setError(err.message || "Gagal mengambil data dari server");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (selectedBulanFilters.length > 0) {
            localStorage.setItem('savedBulan_rating', selectedBulanFilters[0]);
        }
    }, [selectedBulanFilters]);

    // ==========================================
    // LOGIKA FILTER BULAN
    // ==========================================
    const availableMonths = [...new Set(tableData.map(row => row.bulan ? row.bulan.toUpperCase() : ''))].filter(Boolean);

    const filteredData = tableData.filter(row => {
        const rowMonth = row.bulan ? row.bulan.toUpperCase() : '';
        return selectedBulanFilters.includes(rowMonth);
    });

    // ==========================================
    // LOGIKA WARNA KOTAK TANGGAL
    // ==========================================
    const getCellClasses = (value) => {
        const num = parseInt(value);
        if (isNaN(num)) return 'bg-transparent text-[#94A3B8]';
        if (num > 20) return 'bg-[#EF4444] text-white shadow-sm'; // Merah
        if (num > 0 && num <= 20) return 'bg-[#22C55E] text-white shadow-sm'; // Hijau

        if (num === 0) return 'bg-transparent text-[#64748B] font-medium';
        return 'bg-transparent text-[#94A3B8]';
    };

    if (isLoading) {
        return (
            <main className="flex-1 bg-[#F8FAFC] p-4 md:p-8 flex flex-col items-center justify-center min-h-[80vh]">
                <svg className="animate-spin h-8 w-8 sm:h-10 sm:w-10 text-[#00A2E9] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-1 text-center">Mengambil informasi terbaru dari server...</p>
            </main>
        );
    }

    return (
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-2 sm:p-4 md:p-6 lg:p-8 animate-in fade-in duration-500 w-full">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden flex flex-col w-full">

                {/* ========================================== */}
                {/* HEADER KARTU (SUDAH DIREPOSISI & DIRAPIKAN) */}
                {/* ========================================== */}
                <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
                    
                    {/* Bagian Kiri: Judul */}
                    <div>
                        <h2 className="text-lg sm:text-xl font-black text-[#0F172A] tracking-tight uppercase leading-tight">
                            Monitoring Rating Harian
                        </h2>
                        <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-0.5 sm:mt-1">
                            Menampilkan periode hari ke <span className="font-bold text-[#0F172A]">{viewRange === '1-15' ? '1 sampai 15' : '16 sampai 31'}</span>
                        </p>
                    </div>

                    {/* Bagian Kanan: Kumpulan Tombol */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">

                        {/* TOGGLE SWITCH 1-15 / 16-31 */}
                        <div className="flex bg-[#F8FAFC] p-1 rounded-xl border border-[#E2E8F0] shadow-sm">
                            <button
                                onClick={() => setViewRange('1-15')}
                                className={`flex-1 sm:flex-none px-4 py-1.5 text-[13px] font-bold rounded-lg transition-all duration-200 ease-in-out ${viewRange === '1-15'
                                        ? 'bg-white text-[#00A2E9] shadow-sm border border-[#E2E8F0]'
                                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]/50'
                                    }`}
                            >
                                TGL 1-15
                            </button>
                            <button
                                onClick={() => setViewRange('16-31')}
                                className={`flex-1 sm:flex-none px-4 py-1.5 text-[13px] font-bold rounded-lg transition-all duration-200 ease-in-out ${viewRange === '16-31'
                                        ? 'bg-white text-[#00A2E9] shadow-sm border border-[#E2E8F0]'
                                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]/50'
                                    }`}
                            >
                                TGL 16-31
                            </button>
                        </div>

                        {/* TABLE FILTER (Teks 'Periode' dihapus agar presisi seperti di gambar) */}
                        <div className="flex items-center z-50">
                            <TableFilter 
                                alignRight={true}
                                buttonText="Filter Bulan"
                                compactMode={false}
                                filters={[
                                    {
                                        columnName: "Bulan",
                                        uniqueValues: availableMonths,
                                        selectedFilters: selectedBulanFilters,
                                        onFilterChange: setSelectedBulanFilters,
                                        isDatePicker: false
                                    }
                                ]}
                            />
                        </div>

                        {/* EXPORT BUTTON */}
                        <ExportOptionsButton 
                            targetRef={tableRef} 
                            fileName={`Data_Rating_Bulan_${selectedBulanFilters.join('_') || 'Semua'}_Tgl_${viewRange}`}
                            buttonText="Export"
                            onStateChange={setIsScreenshotting}
                            // Memastikan padding dan rounded-full sama persis dengan tinggi TableFilter
                            className="w-full sm:w-auto px-4 py-[7px] text-[13px] rounded-full"
                        />
                    </div>
                </div>
                {/* ========================================== */}

                {/* CONTAINER TABEL */}
                <div ref={tableRef} className={isScreenshotting ? "bg-white w-max min-w-full pb-4" : "bg-white"}>
                    <div className={isScreenshotting ? "w-full custom-scrollbar" : "overflow-x-auto w-full custom-scrollbar"}>
                        {filteredData.length === 0 ? (
                            <div className="text-center py-8 sm:py-12 text-xs sm:text-sm text-[#64748B] font-medium">
                                Data pada bulan {selectedBulanFilters.join(', ') || 'tersebut'} tidak tersedia.
                            </div>
                        ) : (
                            <table className="w-full text-left text-[10px] sm:text-[11px] whitespace-nowrap">
                                <thead className="bg-[#F8FAFC] text-[#64748B] uppercase font-black border-b border-[#E2E8F0]">
                                    <tr>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 w-8 sm:w-12 sticky left-0 z-10 bg-[#F8FAFC] border-r border-[#E2E8F0] text-center">NO</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 w-12 sm:w-16">UI</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 w-12 sm:w-24">UP</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 w-[1%] whitespace-nowrap">UL</th>
                                        <th className="px-2 sm:px-4 py-2 sm:py-3 w-[40%] whitespace-nowrap">BULAN</th>

                                        {(viewRange === '1-15' ? [...Array(15)] : [...Array(16)]).map((_, i) => {
                                            const day = viewRange === '1-15' ? i + 1 : i + 16;
                                            return (
                                                <th key={day} className="px-1 py-2 sm:py-3 text-center w-8 sm:w-10 min-w-[32px] sm:min-w-[40px]">{day}</th>
                                            );
                                        })}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-[#F1F5F9] bg-white">
                                    {filteredData.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 font-bold text-[#64748B] text-center sticky left-0 z-10 bg-white group-hover:bg-slate-50 border-r border-[#E2E8F0] shadow-[2px_0_4px_-1px_rgba(0,0,0,0.05)]">
                                                {idx + 1}
                                            </td>

                                            <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 font-black text-[#00A2E9]">{row.ui}</td>
                                            <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 font-bold text-[#334155]">{row.up}</td>
                                            <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 font-medium text-[#475569] w-[1%] whitespace-nowrap">{row.ul}</td>
                                            <td className="px-2 sm:px-4 py-1.5 sm:py-2.5 font-bold text-[#64748B] w-[1%] whitespace-nowrap">{row.bulan ? row.bulan.toUpperCase() : '-'}</td>

                                            {/* RENDER DATA TANGGAL DINAMIS BERDASARKAN TOGGLE */}
                                            {(viewRange === '1-15' ? [...Array(15)] : [...Array(16)]).map((_, i) => {
                                                const day = viewRange === '1-15' ? i + 1 : i + 16;
                                                const key = `tgl_${day}`;
                                                const val = row[key] || "0";
                                                const isZero = isNaN(parseInt(val)) || parseInt(val) === 0;

                                                return (
                                                    <td key={day} className="px-0.5 sm:px-1 py-1 sm:py-1.5 align-middle text-center">
                                                        <div className={`mx-auto flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded sm:rounded-md transition-transform hover:scale-110 ${getCellClasses(val)}`}>
                                                            {isZero ? '0' : val}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </div>
        </main>
    );
}