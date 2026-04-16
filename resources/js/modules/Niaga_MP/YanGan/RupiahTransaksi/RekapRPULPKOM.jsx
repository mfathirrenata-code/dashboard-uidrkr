import React, { useEffect, useState, useMemo } from "react";
import { useSortableData, SortIcon } from "@/utils/sorting.jsx";
import Pagination from "@/components/shared/pagination.jsx";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

export default function RekapRPULPKOM() {
    const [tableData, setTableData] = useState([]);
    const [chartRawData, setChartRawData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const {
        items: sortedData,
        requestSort,
        sortConfig,
    } = useSortableData(tableData);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // 1. Jalankan 2 fetch secara paralel (bersamaan)
                const [responseTabel, responseChart] = await Promise.all([
                    fetch("http://127.0.0.1:8000/api/rupiah/real-ulp-kom"),
                    fetch("http://127.0.0.1:8000/api/rupiah/real-ulp"),
                ]);

                // 2. Cek apakah ada yang error 404/500
                if (!responseTabel.ok) throw new Error(`Error Tabel: ${responseTabel.status}`);
                if (!responseChart.ok) throw new Error(`Error Chart: ${responseChart.status}`);

                // 3. Ubah ke JSON
                const dataTabel = await responseTabel.json();
                const dataChart = await responseChart.json();

                // 4. Masukkan Data Tabel (Nembak key 'tabelULP' dari Laravel)
                if (dataTabel && dataTabel.tabelULP) {
                    setTableData(dataTabel.tabelULP);
                } else {
                    setTableData([]);
                }

                // 5. Masukkan Data Chart (Nembak key 'data' dari Laravel)
                if (dataChart && dataChart.data) {
                    setChartRawData(dataChart.data);
                } else {
                    setChartRawData([]);
                }
            } catch (err) {
                setError(err.message || "Terjadi kesalahan saat mengambil data dari server");
                console.error("Fetch Error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // ==========================================
    // LOGIKA HEADER DINAMIS
    // ==========================================
    const headers = useMemo(() => {
        if (tableData.length === 0) return [];
        return Object.keys(tableData[0]).filter(
            (key) => key.toLowerCase() !== "no"
        );
    }, [tableData]);

    // ==========================================
    // LOGIKA TABEL
    // ==========================================
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

    const handleSort = (key) => {
        requestSort(key);
        setCurrentPage(1);
    };

    // ==========================================
    // TRANSFORM DATA UNTUK GRAFIK
    // ==========================================
    const monthsOrder = [
        "JAN", "FEB", "MAR", "APR", "MAY", "JUN", 
        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
    ];

    const { chartDataComplete, topUnits } = useMemo(() => {
        if (!chartRawData.length) {
            return { chartDataComplete: [], topUnits: [] };
        }

        const grouped = {};
        const unitTotals = {};
        const unitCounts = {};

        // Kamus penerjemah bulan (buat jaga-jaga format Excel beda)
        const bulanNormalizer = {
            JAN: "JAN", FEB: "FEB", MAR: "MAR", APR: "APR",
            MAY: "MAY", MEI: "MAY", JUN: "JUN", JUL: "JUL",
            AUG: "AUG", AGU: "AUG", SEP: "SEP", OCT: "OCT",
            OKT: "OCT", NOV: "NOV", DEC: "DEC", DES: "DEC"
        };

        chartRawData.forEach((item) => {
            // PERBAIKAN 1: Ekstrak 3 huruf pertama agar cocok dengan monthsOrder
            const rawBulan = String(item.bulan || "").trim().substring(0, 3).toUpperCase();
            const bulan = bulanNormalizer[rawBulan] || rawBulan;
            
            const unit = item.unit_up;

            // PERBAIKAN 2: Key API dari Laravel adalah '%_kom', bukan 'persen'
            const persen = Number(item["%_kom"]) || 0;

            if (!unit || !bulan) return;

            // simpan data per bulan
            if (!grouped[bulan]) {
                grouped[bulan] = {};
            }

            grouped[bulan][unit] = persen;

            // hitung rata-rata per unit
            if (!unitTotals[unit]) {
                unitTotals[unit] = 0;
                unitCounts[unit] = 0;
            }

            unitTotals[unit] += persen;
            unitCounts[unit] += 1;
        });

        // hitung average per unit
        const unitAverages = Object.keys(unitTotals).map((unit) => ({
            unit,
            avg: unitTotals[unit] / unitCounts[unit],
        }));

        // ambil top 10
        const topUnits = unitAverages
            .sort((a, b) => b.avg - a.avg)
            .slice(0, 10)
            .map((u) => u.unit);

        // susun data chart
        const chartDataComplete = monthsOrder.map((bulan) => {
            const row = { bulan };
            topUnits.forEach((unit) => {
                // PERBAIKAN 3: Gunakan ?? null agar grafiknya putus elegan
                row[unit] = grouped[bulan]?.[unit] ?? null;
            });
            return row;
        });

        return { chartDataComplete, topUnits };
    }, [chartRawData]);

    const half = Math.ceil(tableData.length / 2);
    const leftData = tableData.slice(0, half);
    const rightData = tableData.slice(half);

    const renderCell = (row, headerKey, key) => {
        const normalizedKey = headerKey.toLowerCase().replace(/_/g, " ").trim();

        const isKomColumn =
            normalizedKey.includes("%") ||
            normalizedKey.includes("persen") ||
            (normalizedKey.includes("kom") &&
                !normalizedKey.includes("target") &&
                !normalizedKey.includes("real"));

        const isRankColumn = normalizedKey.includes("rank");
        const isBulanColumn = normalizedKey.includes("bulan");

        const rawValue = row?.[headerKey];
        const stringValue = String(rawValue ?? "")
            .replace(",", ".")
            .replace("%", "")
            .trim();

        const numericValue = Number(stringValue);
        const isValidNumber = stringValue !== "" && !isNaN(numericValue);

        let tdClass = "px-3 py-3 text-[#475569]";
        let content = rawValue ?? "-";

        if (isKomColumn && isValidNumber) {
            tdClass = `px-3 py-3 text-center font-black ${
                numericValue >= 100
                    ? "bg-green-50/60 text-green-700"
                    : "bg-red-100 text-red-700"
            }`;
            content = `${numericValue.toFixed(2)}%`;
        } else if (isRankColumn) {
            tdClass = "px-3 py-3 text-center font-black text-[#F59E0B]";
            content = `#${rawValue}`;
        } else if (isValidNumber && !normalizedKey.includes("unit")) {
            tdClass = "px-3 py-3 text-center text-[#475569]";
            content = numericValue.toLocaleString("id-ID");
        } else if (isBulanColumn) {
            tdClass = "px-3 py-3 text-center text-[#475569]";
        }

        return (
            <td key={key} className={tdClass}>
                {content}
            </td>
        );
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#1E293B] border border-[#334155] p-3 rounded-lg shadow-xl">
                    <p className="text-white font-bold text-sm mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div
                            key={index}
                            className="flex justify-between gap-4 text-xs text-white"
                        >
                            <span>{entry.name}</span>
                            <span className="text-[#00A2E9] font-bold">
                                {entry.value}%
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <main className="flex-1 bg-[#F8FAFC] p-8 flex flex-col items-center justify-center min-h-[80vh]">
                <svg
                    className="animate-spin h-10 w-10 text-[#00A2E9] mb-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-20"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-100"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <p className="text-sm text-[#64748B] font-medium mt-1">
                    Mengambil informasi terbaru dari server...
                </p>
            </main>
        );
    }

    return (
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
            {/* TABLE SECTION */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden mb-8">
                <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-black text-[#0F172A] tracking-tight">
                            Rincian Realisasi Transaksi ULP KOM
                        </h2>
                        <p className="text-sm text-[#64748B] font-medium mt-1">
                            Menampilkan{" "}
                            <span className="font-bold text-[#0F172A]">
                                {sortedData.length > 0
                                    ? indexOfFirstItem + 1
                                    : 0}{" "}
                                - {Math.min(indexOfLastItem, sortedData.length)}
                            </span>{" "}
                            dari{" "}
                            <span className="font-bold text-[#0F172A]">
                                {sortedData.length}
                            </span>{" "}
                            data
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-[#F8FAFC] text-[#64748B] uppercase text-xs font-black border-b border-[#E2E8F0]">
                            <tr>
                                <th className="px-3 py-3 text-center">No</th>
                                {headers.map((h, i) => (
                                    <th key={"L" + i} className="px-3 py-3">
                                        {h.replace(/_/g, " ")}
                                    </th>
                                ))}
                                <th className="px-3 py-3 text-center border-l border-[#E2E8F0]">No</th>
                                {headers.map((h, i) => (
                                    <th key={"R" + i} className="px-3 py-3">
                                        {h.replace(/_/g, " ")}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F5F9]">
                            {leftData.map((leftRow, idx) => {
                                const rightRow = rightData[idx];

                                return (
                                    <tr
                                        key={idx}
                                        className="hover:bg-[#F8FAFC]"
                                    >
                                        {/* ================= LEFT ================= */}
                                        <td className="px-3 py-3 text-center font-bold">
                                            {indexOfFirstItem + idx + 1}
                                        </td>

                                        {headers.map((headerKey, cellIdx) => {
                                            return renderCell(
                                                leftRow,
                                                headerKey,
                                                cellIdx
                                            );
                                        })}

                                        {/* ================= RIGHT ================= */}
                                        {rightRow ? (
                                            <>
                                                <td className="px-3 py-3 text-center font-bold border-l border-[#E2E8F0]">
                                                    {indexOfFirstItem + half + idx + 1}
                                                </td>

                                                {headers.map((headerKey, cellIdx) => {
                                                    return renderCell(
                                                        rightRow,
                                                        headerKey,
                                                        cellIdx
                                                    );
                                                })}
                                            </>
                                        ) : (
                                            <>
                                                <td className="border-l border-[#E2E8F0]"></td>
                                                {headers.map((_, i) => (
                                                    <td key={i}></td>
                                                ))}
                                            </>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CHART SECTION */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 mb-6">
                <h3 className="text-lg font-black text-[#0F172A] mb-6">
                    Grafik Realisasi Bulanan (Top 10 ULP)
                </h3>

                <div className="w-full h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartDataComplete}>
                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />

                            <YAxis
                                tickFormatter={(value) =>
                                    `${value.toLocaleString("id-ID")}%`
                                }
                            />

                            <Tooltip content={<CustomTooltip />} />

                            <Legend />

                            {topUnits.map((unit, i) => (
                                <Line
                                    key={i}
                                    type="monotone"
                                    dataKey={unit}
                                    name={unit}
                                    stroke={`hsl(${i * 35}, 80%, 50%)`}
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                    connectNulls={false} 
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </main>
    );
}