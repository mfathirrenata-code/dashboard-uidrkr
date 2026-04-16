import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart
} from 'recharts';
import TableFilter from '@/components/shared/tablefilter.jsx';
import { useSortableData, SortIcon } from "@/utils/sorting.jsx";

// 1. Tambahkan Import ExportOptionsButton (Hapus import toPng)
import ExportOptionsButton from '@/components/shared/ExportOptionsButton';

export default function DashboardSPKLU() {
  const [tableData, setTableData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [harianData, setHarianData] = useState([]);
  const [monKinerja, setMonKinerja] = useState([]);

  const [filterOptions, setFilterOptions] = useState({ bulan: [], tanggal: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ==========================================
  // STATE FILTER
  // ==========================================
  const [selectedUp3Filters, setSelectedUp3Filters] = useState([]);
  const [selectedUlpFilters, setSelectedUlpFilters] = useState([]);
  const [selectedTahunFilters, setSelectedTahunFilters] = useState([]);
  const [selectedBulanFilters, setSelectedBulanFilters] = useState([]);
  const [selectedTanggalFilters, setSelectedTanggalFilters] = useState([]);
  const [selectedSpkluFilters, setSelectedSpkluFilters] = useState([]);

  // STATE & REF SCREENSHOT TABEL
  const tableRef = useRef(null);
  const [isScreenshotting, setIsScreenshotting] = useState(false);

  // ==========================================
  // FETCH API DARI LARAVEL
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/spklu/data`);
        if (!response.ok) throw new Error(`Server Error: ${response.status}`);
        const data = await response.json();

        const actualData = Array.isArray(data) ? data : (data.dataSpklu || []);
        if (actualData && actualData.length > 0) setTableData(actualData);
        else setTableData([]);

        if (data.trendBulanan && data.trendBulanan.length > 0) setTrendData(data.trendBulanan);
        else setTrendData([]);

        if (data.trendHarian && data.trendHarian.length > 0) setHarianData(data.trendHarian);
        else setHarianData([]);

        if (data.monKinerja && data.monKinerja.length > 0) setMonKinerja(data.monKinerja);
        else setMonKinerja([]);

        if (data.filterOptions) setFilterOptions(data.filterOptions);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ==========================================
  // NILAI UNIK UNTUK FILTER
  // ==========================================
  const uniqueUp3Values = useMemo(() => [...new Set(tableData.map(item => item.up3))].filter(Boolean).sort(), [tableData]);
  const uniqueUlpValues = useMemo(() => [...new Set(tableData.map(item => item.ulp))].filter(Boolean).sort(), [tableData]);
  const uniqueSpkluValues = useMemo(() => [...new Set(tableData.map(item => item.nama_spklu))].filter(Boolean).sort(), [tableData]);

  const uniqueTahunValues = filterOptions.tahun || [];
  const uniqueBulanValues = filterOptions.bulan || [];
  const uniqueTanggalValues = filterOptions.tanggal || [];

  useEffect(() => { if (uniqueUp3Values.length > 0 && selectedUp3Filters.length === 0) setSelectedUp3Filters(uniqueUp3Values); }, [uniqueUp3Values]);
  useEffect(() => { if (uniqueUlpValues.length > 0 && selectedUlpFilters.length === 0) setSelectedUlpFilters(uniqueUlpValues); }, [uniqueUlpValues]);
  useEffect(() => { if (uniqueTahunValues.length > 0 && selectedTahunFilters.length === 0) setSelectedTahunFilters(uniqueTahunValues); }, [uniqueTahunValues]);
  useEffect(() => { if (uniqueBulanValues.length > 0 && selectedBulanFilters.length === 0) setSelectedBulanFilters(uniqueBulanValues); }, [uniqueBulanValues]);
  useEffect(() => { if (uniqueTanggalValues.length > 0 && selectedTanggalFilters.length === 0) setSelectedTanggalFilters(uniqueTanggalValues); }, [uniqueTanggalValues]);
  useEffect(() => { if (uniqueSpkluValues.length > 0 && selectedSpkluFilters.length === 0) setSelectedSpkluFilters(uniqueSpkluValues); }, [uniqueSpkluValues]);

  // ==========================================
  // APLIKASIKAN FILTER PADA DATA TABEL
  // ==========================================
  const filteredTableData = useMemo(() => {
    return tableData.filter(row => {
      const matchUp3 = selectedUp3Filters.length === 0 || selectedUp3Filters.includes(row.up3);
      const matchUlp = selectedUlpFilters.length === 0 || !row.ulp || selectedUlpFilters.includes(row.ulp);
      const matchTahun = selectedTahunFilters.length === 0 || !row.tahun || selectedTahunFilters.includes(row.tahun);
      const matchSpklu = selectedSpkluFilters.length === 0 || selectedSpkluFilters.includes(row.nama_spklu);

      return matchUp3 && matchUlp && matchTahun && matchSpklu;
    });
  }, [tableData, selectedUp3Filters, selectedUlpFilters, selectedTahunFilters, selectedSpkluFilters]);

  const formatSingkat = (num) => {
    if (!num) return '0';
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '').replace('.', ',') + ' m';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '').replace('.', ',') + ' jt';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '').replace('.', ',') + ' rb';
    return num.toLocaleString('id-ID');
  };

  const up3ChartData = useMemo(() => {
    const grouped = filteredTableData.reduce((acc, curr) => {
      if (!curr.up3) return acc;
      if (!acc[curr.up3]) acc[curr.up3] = 0;
      acc[curr.up3] += Number(curr.transaksi) || 0;
      return acc;
    }, {});
    return Object.keys(grouped).map(key => ({ name: key, transaksi: grouped[key] })).sort((a, b) => b.transaksi - a.transaksi);
  }, [filteredTableData]);

  const COLORS = ['#EC4899', '#F59E0B', '#00A2E9', '#FCD34D', '#3B82F6', '#10B981', '#8B5CF6'];

  const totals = useMemo(() => {
    return filteredTableData.reduce((acc, curr) => {
      acc.transaksi += Number(curr.transaksi) || 0;
      acc.rpkwh += Number(curr.rpkwh) || 0;
      acc.kwh += Number(curr.kwh) || 0;
      return acc;
    }, { transaksi: 0, rpkwh: 0, kwh: 0 });
  }, [filteredTableData]);

  const { items: sortedData, requestSort, sortConfig } = useSortableData(filteredTableData);
  const handleSort = (key) => requestSort(key);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded-xl text-xs font-medium z-50">
          <p className="font-bold text-[#0F172A] mb-1 border-b pb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.fill || entry.color }} className="mb-0.5">
              {entry.name}: {entry.value.toLocaleString('id-ID')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10} fontWeight="bold">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  if (isLoading) {
    return (
      <main className="flex-1 bg-[#F8FAFC] p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[80vh]">
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
      <main className="flex-1 bg-[#F8FAFC] p-4 md:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center py-20 bg-red-50 rounded-2xl border border-red-200 text-center px-4">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h3 className="text-lg font-black text-red-600 mb-2">Gagal Memuat Data</h3>
          <p className="text-red-500 text-sm max-w-md">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors">
            Refresh Halaman
          </button>
        </div>
      </main>
    );
  }

  return (
    // Padding layout diperkecil agar terasa lebih padat/zoom-out
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-3 md:p-4 lg:p-5">
      <div className="space-y-4 animate-in fade-in duration-500 bg-[#F8FAFC] pb-4">

        {/* HEADER UTAMA */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] border-t-[3px] border-t-[#00A2E9] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 p-3 sm:p-4">
          <div>
            <h1 className="text-base font-black text-[#0F172A] uppercase">Dashboard SPKLU</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Monitoring Infrastruktur & Transaksi PLN Mobile</p>
          </div>
        </div>

        {/* ========================================== */}
        {/* CONTAINER FILTER 1 BARIS MEMANJANG (DIUBAH KE FORMAT ARRAY BARU) */}
        {/* ========================================== */}
        <div className="bg-white p-3 rounded-xl shadow-sm border border-[#E2E8F0] relative z-[60] pt-5 py-5">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 w-full">
            {uniqueUp3Values.length > 0 && <TableFilter buttonText="Nama UP3" fullWidth={true} compactMode={false} filters={[{ columnName: "NAMA UP3", uniqueValues: uniqueUp3Values, selectedFilters: selectedUp3Filters, onFilterChange: setSelectedUp3Filters }]} />}
            {uniqueTahunValues.length > 0 && <TableFilter buttonText="Tahun" fullWidth={true} compactMode={false} filters={[{ columnName: "TAHUN", uniqueValues: uniqueTahunValues, selectedFilters: selectedTahunFilters, onFilterChange: setSelectedTahunFilters }]} />}
            {uniqueTanggalValues.length > 0 && <TableFilter buttonText="Tanggal" fullWidth={true} compactMode={false} filters={[{ columnName: "RENTANG TANGGAL", uniqueValues: uniqueTanggalValues, selectedFilters: selectedTanggalFilters, onFilterChange: setSelectedTanggalFilters, isDatePicker: true }]} />}
            {uniqueUlpValues.length > 0 && <TableFilter buttonText="Nama ULP" fullWidth={true} compactMode={false} filters={[{ columnName: "NAMA ULP", uniqueValues: uniqueUlpValues, selectedFilters: selectedUlpFilters, onFilterChange: setSelectedUlpFilters }]} />}
            {uniqueBulanValues.length > 0 && <TableFilter buttonText="Bulan" fullWidth={true} compactMode={false} alignRight={true} filters={[{ columnName: "BULAN", uniqueValues: uniqueBulanValues, selectedFilters: selectedBulanFilters, onFilterChange: setSelectedBulanFilters }]} />}
            {uniqueSpkluValues.length > 0 && <TableFilter buttonText="Nama SPKLU" fullWidth={true} compactMode={false} alignRight={true} filters={[{ columnName: "NAMA SPKLU", uniqueValues: uniqueSpkluValues, selectedFilters: selectedSpkluFilters, onFilterChange: setSelectedSpkluFilters }]} />}
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E8F0]">
            <p className="text-[#64748B] font-bold text-[10px] uppercase tracking-wider mb-1">Total Aset</p>
            <h3 className="text-2xl font-black text-[#00A2E9]">51</h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E8F0]">
            <p className="text-[#64748B] font-bold text-[10px] uppercase tracking-wider mb-1">SPKLU Aktif</p>
            <h3 className="text-2xl font-black text-[#34D399]">42</h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E8F0]">
            <p className="text-[#64748B] font-bold text-[10px] uppercase tracking-wider mb-1">Transaksi</p>
            <h3 className="text-2xl font-black text-[#F59E0B]">{totals.transaksi.toLocaleString('id-ID')}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E8F0]">
            <p className="text-[#64748B] font-bold text-[10px] uppercase tracking-wider mb-1">Total Rp KWH</p>
            <h3 className="text-xl font-black text-[#8B5CF6] truncate" title={totals.rpkwh.toLocaleString('id-ID')}>{formatSingkat(totals.rpkwh)}</h3>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E8F0]">
            <p className="text-[#64748B] font-bold text-[10px] uppercase tracking-wider mb-1">Total KWH</p>
            <h3 className="text-xl font-black text-[#EC4899] truncate" title={totals.kwh.toLocaleString('id-ID')}>{formatSingkat(totals.kwh)}</h3>
          </div>
        </div>

        {/* TABEL SPKLU & GRAFIK TREN BULANAN */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">

          {/* TABEL SPKLU */}
          <div className={`xl:col-span-7 bg-white rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col h-[450px] ${isScreenshotting ? 'h-auto' : 'overflow-hidden'}`}>
            <div className="p-3 border-b border-[#E2E8F0] bg-[#F0F9FF] flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-[#0F172A]">Rincian Transaksi SPKLU</h3>
                <p className="text-[11px] text-[#64748B] font-medium mt-0.5">Detail KWH dan Rupiah per mesin</p>
              </div>
              
              {/* PEMANGGILAN EXPORT BUTTON */}
              <ExportOptionsButton 
                  targetRef={tableRef} 
                  fileName="Tabel_Transaksi_SPKLU"
                  buttonText="Export"
                  onStateChange={setIsScreenshotting}
                  className="px-3 py-1.5 text-xs rounded-full"
              />
            </div>

            <div ref={tableRef} className={isScreenshotting ? "h-auto" : "flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200"}>
              <table className="w-full text-left text-[11px] relative table-fixed">
                <thead className="bg-[#F8FAFC] text-[#64748B] uppercase text-[10px] font-black border-b border-[#E2E8F0] sticky top-0 z-10 shadow-sm outline outline-1 outline-[#E2E8F0]">
                  <tr>
                    <th className="p-2 w-8 text-center">No</th>
                    <th className="p-2 cursor-pointer hover:text-[#00A2E9] w-[30%]" onClick={() => handleSort('nama_spklu')}><div className="flex items-center bg-[#F8FAFC]">Nama SPKLU <SortIcon columnKey="nama_spklu" sortConfig={sortConfig} /></div></th>
                    <th className="p-2 cursor-pointer hover:text-[#00A2E9] w-[20%]" onClick={() => handleSort('up3')}><div className="flex items-center bg-[#F8FAFC]">UP3 <SortIcon columnKey="up3" sortConfig={sortConfig} /></div></th>
                    <th className="p-2 text-right cursor-pointer hover:text-[#00A2E9]" onClick={() => handleSort('kwh')}><div className="flex items-center justify-end bg-[#F8FAFC]">KWH <SortIcon columnKey="kwh" sortConfig={sortConfig} /></div></th>
                    <th className="p-2 text-right cursor-pointer hover:text-[#00A2E9]" onClick={() => handleSort('rpkwh')}><div className="flex items-center justify-end bg-[#F8FAFC]">RP KWH <SortIcon columnKey="rpkwh" sortConfig={sortConfig} /></div></th>
                    <th className="p-2 text-right cursor-pointer hover:text-[#00A2E9] w-[12%]" onClick={() => handleSort('transaksi')}><div className="flex items-center justify-end bg-[#F8FAFC]">TRX <SortIcon columnKey="transaksi" sortConfig={sortConfig} /></div></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] bg-white">
                  {sortedData.length === 0 ? (
                    <tr><td colSpan="6" className="p-4 text-center text-[#64748B]">Data tidak ditemukan</td></tr>
                  ) : (
                    sortedData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="p-2 text-center text-[#64748B] font-medium">{idx + 1}</td>
                        <td className="p-2 font-bold text-[#00A2E9] truncate" title={row.nama_spklu}>{row.nama_spklu}</td>
                        <td className="p-2 text-[#475569] truncate" title={row.up3}>{row.up3}</td>
                        <td className="p-2 text-right text-[#00A2E9] font-semibold">{formatSingkat(row.kwh)}</td>
                        <td className="p-2 text-right text-[#8B5CF6] font-semibold">{formatSingkat(row.rpkwh)}</td>
                        <td className="p-2 text-right text-[#EC4899] font-black">{row.transaksi.toLocaleString('id-ID')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-[#F8FAFC] font-black text-[#0F172A] sticky bottom-0 z-10 shadow-[0_-1px_2px_rgba(0,0,0,0.05)] border-t-2 border-[#E2E8F0]">
                  <tr>
                    <td colSpan="3" className="p-2 text-right uppercase tracking-wider text-[10px]">Total Keseluruhan:</td>
                    <td className="p-2 text-right text-[#00A2E9]">{formatSingkat(totals.kwh)}</td>
                    <td className="p-2 text-right text-[#8B5CF6]">{formatSingkat(totals.rpkwh)}</td>
                    <td className="p-2 text-right text-[#EC4899]">{totals.transaksi.toLocaleString('id-ID')}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* GRAFIK BULANAN */}
          <div className="xl:col-span-5 bg-white p-4 rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col h-[450px]">
            <h3 className="text-sm font-black text-[#0F172A] mb-4">Tren Transaksi Bulanan</h3>
            <div className="flex-1 w-full relative">
              <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#A78BFA', fontSize: 10, fontWeight: 'bold' }} tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(0)}m` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} iconType="circle" />
                    <Bar yAxisId="right" dataKey="kwh" name="KWH" fill="#00A2E9" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar yAxisId="right" dataKey="rpkwh" name="RP KWH" fill="#FCD34D" radius={[4, 4, 0, 0]} barSize={12} />
                    <Line yAxisId="left" type="monotone" dataKey="transaksi" name="Transaksi" stroke="#EC4899" strokeWidth={2} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* PER UP3 */}
        {/* ========================================== */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-block px-3 py-1 bg-[#EC4899] text-white font-black rounded-md text-xs uppercase shadow-sm tracking-wide">
              PER UP3
            </span>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-[#E2E8F0] to-transparent rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* PIE CHART */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col hover:shadow-md transition-shadow">
              <div className="mb-3 border-b border-[#E2E8F0] pb-3">
                <h3 className="text-sm font-black text-[#0F172A] flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#EC4899]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                  Distribusi Proporsi Transaksi
                </h3>
                <p className="text-[11px] text-[#64748B] mt-0.5 font-medium">Persentase sebaran transaksi per unit UP3.</p>
              </div>

              <div className="flex-1 relative min-h-[240px] w-full">
                <div className="absolute inset-0 flex justify-center">
                  {up3ChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={up3ChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2} dataKey="transaksi" labelLine={false} label={renderCustomizedLabel}>
                          {up3ChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '5px' }} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div className="flex items-center justify-center h-full text-[#64748B] text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200 w-full">Data belum tersedia</div>}
                </div>
              </div>
            </div>

            {/* BAR CHART */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col hover:shadow-md transition-shadow">
              <div className="mb-3 border-b border-[#E2E8F0] pb-3">
                <h3 className="text-sm font-black text-[#0F172A] flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#00A2E9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Perbandingan Volume Transaksi
                </h3>
                <p className="text-[11px] text-[#64748B] mt-0.5 font-medium">Pemeringkatan total transaksi dari yang tertinggi hingga terendah.</p>
              </div>

              <div className="flex-1 relative min-h-[240px] w-full">
                <div className="absolute inset-0">
                  {up3ChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={up3ChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#475569' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#475569' }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)} rb` : v} />
                        <Tooltip cursor={{ fill: '#F8FAFC' }} content={<CustomTooltip />} />
                        <Bar dataKey="transaksi" name="Total Transaksi" fill="#00A2E9" barSize={30} radius={[4, 4, 0, 0]}>
                          {up3ChartData.map((entry, index) => <Cell key={`cell-${index}`} fill="#06B6D4" />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="flex items-center justify-center h-full text-[#64748B] text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200 w-full">Data belum tersedia</div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* MON HARIAN */}
        {/* ========================================== */}
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-center gap-3">
            <span className="inline-block px-3 py-1 bg-[#EC4899] text-white font-black rounded-md text-xs uppercase shadow-sm tracking-wide">
              MON HARIAN
            </span>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-[#E2E8F0] to-transparent rounded-full"></div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col hover:shadow-md transition-shadow">
            <div className="mb-3 border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-black text-[#0F172A] flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#DC2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Analisis Komparatif Harian
              </h3>
              <p className="text-[11px] text-[#64748B] mt-0.5 font-medium">Visualisasi tren jumlah transaksi (Batang) berdampingan dengan konsumsi kwh (Garis) setiap harinya.</p>
            </div>

            <div className="flex-1 relative min-h-[300px] w-full mt-2">
              <div className="absolute inset-0">
                {harianData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={harianData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} dy={10} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 9 }} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#DC2626', fontSize: 9, fontWeight: 'bold' }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)} rb` : v} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                      <Legend wrapperStyle={{ fontSize: '10px', top: -20 }} iconType="circle" />
                      <Bar yAxisId="left" dataKey="transaksi" name="TRANSAKSI" fill="#06B6D4" barSize={16} />
                      <Line yAxisId="right" type="monotone" dataKey="kwh" name="kwh" stroke="#DC2626" strokeWidth={2} dot={{ r: 3, fill: '#DC2626', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-[#64748B] text-xs bg-slate-50 rounded-lg border border-dashed border-slate-300 w-full">
                    Data Harian Belum Tersedia.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* MON KINERJA */}
        {/* ========================================== */}
        <div className="flex flex-col gap-3 mt-2">
          <div className="flex items-center gap-3">
            <span className="inline-block px-3 py-1 bg-[#EC4899] text-white font-black rounded-md text-xs uppercase shadow-sm tracking-wide">
              MON KINERJA
            </span>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-[#E2E8F0] to-transparent rounded-full"></div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E2E8F0] flex flex-col hover:shadow-md transition-shadow">
            <div className="mb-4 border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-black text-[#0F172A] flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Rekapitulasi Target dan Realisasi
              </h3>
              <p className="text-[11px] text-[#64748B] mt-0.5 font-medium">Tabel pemantauan kinerja bulanan (T: Target, R: Realisasi) untuk seluruh Unit Induk dan Unit Pelaksana.</p>
            </div>

            {monKinerja.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-[#64748B] text-xs bg-slate-50 rounded-lg border border-dashed border-slate-300">
                Data Mon Kinerja Belum Tersedia.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg">
                  <table className="w-full text-center text-[10px] xl:text-[11px] whitespace-nowrap">
                    <thead className="bg-[#F8FAFC] text-[#64748B] font-black uppercase border-b border-[#E2E8F0]">
                      <tr>
                        <th className="px-3 py-2 text-left w-40">UI/UP</th>
                        <th className="px-1.5 py-2">T JAN</th><th className="px-1.5 py-2">R JAN</th>
                        <th className="px-1.5 py-2">T FEB</th><th className="px-1.5 py-2">R FEB</th>
                        <th className="px-1.5 py-2">T MAR</th><th className="px-1.5 py-2">R MAR</th>
                        <th className="px-1.5 py-2">T APR</th><th className="px-1.5 py-2">R APR</th>
                        <th className="px-1.5 py-2">T MAY</th><th className="px-1.5 py-2">R MAY</th>
                        <th className="px-1.5 py-2">T JUN</th><th className="px-1.5 py-2">R JUN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9] bg-white text-[#0F172A]">
                      {monKinerja.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors font-medium">
                          <td className="px-3 py-2 text-left font-bold text-[#00A2E9]">{row.ui_up}</td>
                          <td className="px-1.5 py-2">{row.t_jan.toLocaleString('id-ID')}</td><td className="px-1.5 py-2 ">{row.r_jan.toLocaleString('id-ID')}</td>
                          <td className="px-1.5 py-2">{row.t_feb.toLocaleString('id-ID')}</td><td className="px-1.5 py-2 ">{row.r_feb.toLocaleString('id-ID')}</td>
                          <td className="px-1.5 py-2">{row.t_mar.toLocaleString('id-ID')}</td><td className="px-1.5 py-2 ">{row.r_mar.toLocaleString('id-ID')}</td>
                          <td className="px-1.5 py-2">{row.t_apr.toLocaleString('id-ID')}</td><td className="px-1.5 py-2 ">{row.r_apr.toLocaleString('id-ID')}</td>
                          <td className="px-1.5 py-2">{row.t_may.toLocaleString('id-ID')}</td><td className="px-1.5 py-2 ">{row.r_may.toLocaleString('id-ID')}</td>
                          <td className="px-1.5 py-2">{row.t_jun.toLocaleString('id-ID')}</td><td className="px-1.5 py-2 ">{row.r_jun.toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto border border-[#E2E8F0] rounded-lg">
                  <table className="w-full text-center text-[10px] xl:text-[11px] whitespace-nowrap">
                    <thead className="bg-[#F8FAFC] text-[#64748B] font-black uppercase border-b border-[#E2E8F0]">
                      <tr>
                        <th className="px-3 py-2 text-left w-40 ">UI/UP</th>
                        <th className="px-1.5 py-2">T JUL</th><th className="px-1.5 py-2">R JUL</th>
                        <th className="px-1.5 py-2">T AUG</th><th className="px-1.5 py-2">R AUG</th>
                        <th className="px-1.5 py-2">T SEP</th><th className="px-1.5 py-2">R SEP</th>
                        <th className="px-1.5 py-2">T OCT</th><th className="px-1.5 py-2">R OCT</th>
                        <th className="px-1.5 py-2">T NOV</th><th className="px-1.5 py-2">R NOV</th>
                        <th className="px-1.5 py-2">T DEC</th><th className="px-1.5 py-2">R DEC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F1F5F9] bg-white text-[#0F172A]">
                      {monKinerja.map((row, idx) => (
                        <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors font-medium">
                          <td className="px-3 py-2 text-left font-bold text-[#00A2E9]">{row.ui_up}</td>
                          <td className="px-1.5 py-2">{row.t_jul.toLocaleString('id-ID')}</td><td className="px-1.5 py-2 ">{row.r_jul.toLocaleString('id-ID')}</td>
                          <td className="px-1.5 py-2">{row.t_aug.toLocaleString('id-ID')}</td><td className="px-1.5 py-2 ">{row.r_aug.toLocaleString('id-ID')}</td>
                          <td className="px-1.5 py-2">{row.t_sep.toLocaleString('id-ID')}</td><td className="px-1.5 py-2 ">{row.r_sep.toLocaleString('id-ID')}</td>
                          <td className="px-1.5 py-2">{row.t_oct.toLocaleString('id-ID')}</td><td className="px-1.5 py-2 ">{row.r_oct.toLocaleString('id-ID')}</td>
                          <td className="px-1.5 py-2">{row.t_nov.toLocaleString('id-ID')}</td><td className="px-1.5 py-2 ">{row.r_nov.toLocaleString('id-ID')}</td>
                          <td className="px-1.5 py-2">{row.t_dec.toLocaleString('id-ID')}</td><td className="px-1.5 py-2 ">{row.r_dec.toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}