    import React, { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Tooltip as LeafletTooltip } from "react-leaflet";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell,
    ResponsiveContainer,
    CartesianGrid,
    Legend,
} from "recharts";
import "leaflet/dist/leaflet.css";
import Pagination from "@/components/shared/pagination.jsx";
import L from "leaflet";

export default function RekapRPUP3KOM() {
    const [tableData, setTableData] = useState([]);
    const [chartRawData, setChartRawData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const [responseTabel, responseChart] = await Promise.all([
                    fetch("http://127.0.0.1:8000/api/rupiah/rekap-up3"),
                    fetch("http://127.0.0.1:8000/api/rupiah/real-up3")
                ]);

                if (!responseTabel.ok) throw new Error(`Error Tabel: ${responseTabel.status}`);
                if (!responseChart.ok) throw new Error(`Error Chart: ${responseChart.status}`);

                const dataTabel = await responseTabel.json();
                const dataChart = await responseChart.json();

                if (dataTabel && dataTabel.tabelUP3) {
                    setTableData(dataTabel.tabelUP3);
                } else if (dataTabel && dataTabel.tabelULP) {
                    setTableData(dataTabel.tabelULP);
                } else {
                    setTableData([]);
                }

                if (dataChart && dataChart.tabelULP) {
                    setChartRawData(dataChart.tabelULP);
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

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);

    const mapData = Object.values(
        tableData.reduce((acc, item) => {
            const unit = item.unit_ap;

            if (!acc[unit]) {
                acc[unit] = {
                    unit_ap: unit,
                    target: 0,
                    real: 0,
                    persen: 0,
                };
            }

            acc[unit].target += Number(item.target) || 0;
            acc[unit].real += Number(item.real) || 0;

            acc[unit].persen = acc[unit].target
                ? ((acc[unit].real / acc[unit].target) * 100).toFixed(1)
                : 0;

            return acc;
        }, {}),
    );

    // PERBAIKAN 1: Cari pakai unit_ap, bukan unit
    const topUnits = useMemo(() => {
        return [...new Set(
            chartRawData.map(item => item["unit_ap"]).filter(Boolean)
        )].slice(0, 5);
    }, [chartRawData]);

    const chartUnitAP = Object.values(
        tableData.reduce((acc, item) => {
            const unit = item.unit_ap;
            const persen = Number(item.persen) || 0;

            if (!acc[unit]) {
                acc[unit] = {
                    unit_ap: unit,
                    persen: 0,
                    count: 0,
                };
            }

            acc[unit].persen += persen;
            acc[unit].count += 1;

            return acc;
        }, {}),
    ).map((item) => ({
        unit_ap: item.unit_ap,
        persen: (item.persen / item.count).toFixed(1),
    }));

    const sortedChartUnitAP = useMemo(() => {
        return [...chartUnitAP].sort((a, b) => b.persen - a.persen);
    }, [chartUnitAP]);

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];

    const bulanMap = {
        JAN: "Januari", FEB: "Februari", MAR: "Maret", APR: "April",
        MAY: "Mei", JUN: "Juni", JUL: "Juli", AUG: "Agustus",
        SEP: "September", OCT: "Oktober", NOV: "November", DEC: "Desember",
    };

    // PERBAIKAN 2: Gunakan unit_ap sebagai key
    const monthlyDataLookup = chartRawData.reduce((acc, item) => {
        const unit = item["unit_ap"]; // <-- Diubah dari item["unit"]

        const bulanRaw = item["bulan"] ?? "";
        const bulanKey = bulanRaw.toString().trim().toUpperCase();
        const bulan = bulanMap[bulanKey];

        const persenRaw = item["persen"];
        const persen = parseFloat(
            String(persenRaw)
                .replace("%", "")
                .replace(",", ".")
        ) || 0;

        if (!bulan || !unit) return acc;
        if (!acc[bulan]) acc[bulan] = {};

        acc[bulan][unit] = persen;
        return acc;
    }, {});

    const chartDataComplete = months.map((bulan) => {
        const data = { bulan };
        topUnits.forEach((unit) => {
            // JIKA DATA KOSONG, UBAH JADI 0
            data[unit] = monthlyDataLookup[bulan]?.[unit] ?? 0; 
        });
        return data;
    });

    const warnaDot = {
        "PEKANBARU": "#E91E8C",
        "DUMAI": "#FF6B35",
        "BANGKINANG": "#FFD600",
        "RENGAT": "#00BCD4",
        "TANJUNG PINANG": "#2196F3",
    };

    const lokasiUP = {
        "PEKANBARU": { lat: 0.5071, lng: 101.4478 },
        "DUMAI": { lat: 1.6653, lng: 101.4478 },
        "BANGKINANG": { lat: 0.3356, lng: 101.0275 },
        "RENGAT": { lat: -0.3512, lng: 102.3356 },
        "TANJUNG PINANG": { lat: 0.9189, lng: 104.4305 },
    };

    const getColor = (name) => {
        const key = (name || "")
            .toUpperCase()
            .replace(/_/g, " ")
            .trim();
        return warnaDot[key] || "#8884d8";
    };

    const createCustomIcon = (persen, warna) => L.divIcon({
        className: "",
        html: `
            <div style="text-align:center; transform: translate(-50%, -50%)">
                <div style="color:${warna}; font-size:11px; font-weight:900; 
                            text-shadow: 0 0 6px rgba(0,0,0,0.9); white-space:nowrap;">
                    % KOM
                </div>
                <div style="color:${warna}; font-size:18px; font-weight:900; 
                            text-shadow: 0 0 8px rgba(0,0,0,0.9); white-space:nowrap;">
                    ${persen}%
                </div>
                <div style="width:12px; height:12px; border-radius:50%; 
                            background:${warna}; margin: 3px auto 0;
                            box-shadow: 0 0 8px ${warna};">
                </div>
            </div>
        `,
        iconSize: [0, 0],
    });

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
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
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

    return (
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* TABEL TOP 5 */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
                    <div className="p-5 border-b border-[#E2E8F0]">
                        <h2 className="text-xl font-black text-[#0F172A]">Realisasi Transaksi</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-[#F8FAFC] text-xs uppercase font-black border-b">
                                <tr>
                                    <th className="px-4 py-3">Unit AP</th>
                                    <th className="px-4 py-3">Bulan</th>
                                    <th className="px-4 py-3 text-center">Target</th>
                                    <th className="px-4 py-3 text-center">Real Kom</th>
                                    <th className="px-4 py-3 text-center">% Kom</th>
                                    <th className="px-4 py-3">Rank</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData
                                    .sort((a, b) => b.persen - a.persen)
                                    .slice(0, 5)
                                    .map((row, idx) => {
                                        const isTargetAchieved = (row.persen || 0) >= 100;
                                        return (
                                            <tr key={idx} className="border-b hover:bg-slate-50">
                                                <td className="px-4 py-3 font-bold" style={{ color: getColor(row.unit_ap) }}>
                                                    {row.unit_ap}
                                                </td>
                                                <td className="px-4 py-3 font-bold">{row.bulan}</td>
                                                <td className="px-4 py-3 text-center">{row.target?.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-center text-[#00A2E9] font-bold">
                                                    {row.real?.toLocaleString()}
                                                </td>
                                                <td className={`px-4 py-3 text-center font-bold ${isTargetAchieved ? "text-green-600" : "text-red-600"}`}>
                                                    {row.persen}%
                                                </td>
                                                <td className="px-4 py-3 font-bold">{row.rank}</td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* GRAFIK BAR UNIT AP */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
                    <h3 className="text-lg font-black text-[#0F172A] mb-4">Grafik Persentase Unit AP</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={sortedChartUnitAP}
                                layout="vertical"
                                margin={{ left: 20, right: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    type="number"
                                    domain={[0, 200]}
                                    ticks={[0, 50, 100, 150, 200]}
                                    tickFormatter={(v) => `${v}%`}
                                />
                                <YAxis type="category" dataKey="unit_ap" width={120} />
                                <Tooltip formatter={(v) => `${v}%`} />
                                <Bar dataKey="persen" radius={[0, 6, 6, 0]}>
                                    {sortedChartUnitAP.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={getColor(entry.unit_ap)}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* MAP REALISASI */}
            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6">
                <h3 className="text-lg font-black text-[#0F172A] mb-4">Maps Realisasi UP3</h3>
                <div className="h-[450px] rounded-xl overflow-hidden">
                    <MapContainer center={[0.5, 102.5]} zoom={7} style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                        />
                        {mapData.map((row, i) => {
                            const posisi = lokasiUP[row.unit_ap];
                            if (!posisi) return null;
                            const warna = getColor(row.unit_ap);

                            return (
                                <Marker
                                    key={i}
                                    position={[posisi.lat, posisi.lng]}
                                    icon={createCustomIcon(row.persen, warna)}
                                >
                                    <LeafletTooltip permanent={true} direction="right" offset={[10, 0]} opacity={1} className="custom-tooltip">
                                        <div style={{ minWidth: "140px" }}>
                                            <div style={{ color: warna, fontWeight: "900", fontSize: "13px", borderBottom: `2px solid ${warna}`, paddingBottom: "4px", marginBottom: "6px" }}>
                                                {row.unit_ap}
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                                                <span style={{ color: "#64748B", fontSize: "11px" }}>Target</span>
                                                <span style={{ fontWeight: "700", fontSize: "11px" }}>{row.target?.toLocaleString()}</span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "4px" }}>
                                                <span style={{ color: "#64748B", fontSize: "11px" }}>Real</span>
                                                <span style={{ fontWeight: "700", fontSize: "11px" }}>{row.real?.toLocaleString()}</span>
                                            </div>
                                            <div style={{ marginTop: "8px", textAlign: "center", background: warna, color: "#fff", fontWeight: "900", fontSize: "15px", borderRadius: "6px", padding: "3px 0" }}>
                                                {row.persen}%
                                            </div>
                                        </div>
                                    </LeafletTooltip>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4 items-center">
                    <span className="text-xs font-black text-[#64748B]">UNIT AP</span>
                    {Object.entries(warnaDot).map(([unit, warna]) => (
                        <div key={unit} className="flex items-center gap-1.5">
                            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: warna }} />
                            <span className="text-xs font-semibold text-[#0F172A]">
                                {unit.replace("UP ", "").toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* GRAFIK LINE BULANAN */}
            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 min-w-0">
                <h3 className="text-lg font-black text-[#0F172A] mb-6">Grafik Realisasi Bulanan</h3>
                <div className="w-full h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartDataComplete}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="bulan" />
                            <YAxis tickFormatter={(v) => `${v}%`} />
                            <Tooltip formatter={(v) => `${v}%`} />
                            <Legend />

                            {/* PERBAIKAN 3: Warna garis ngikut warna dot Maps */}
                            {topUnits.map((unit, i) => (
                                <Line
                                    key={i}
                                    type="monotone"
                                    dataKey={unit}
                                    stroke={getColor(unit)} 
                                    strokeWidth={3}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </main>
    );
}