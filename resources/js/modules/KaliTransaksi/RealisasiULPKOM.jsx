import React, { useEffect, useState, useMemo } from 'react';
import { useSortableData, SortIcon } from "@/utils/sorting.jsx";
import Pagination from "@/components/pagination.jsx";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function RealisasiULPKOM() {
  const [tableData, setTableData] = useState([]);
  const [chartRawData, setChartRawData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { items: sortedData, requestSort, sortConfig } = useSortableData(tableData);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/get-sheet-data?type=rekap_ulp`);

        if (!response.ok) throw new Error(`Server Error: ${response.status}`);

        const data = await response.json();

        if (data && !data.error) {
          setTableData(data.tabelULP || []);
          setChartRawData(data.chartULP || []);
        } else {
          setTableData([]);
          setChartRawData([]);
        }
      } catch (err) {
        setError(err.message || "Gagal mengambil data dari server");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ==========================================
  // LOGIKA HEADER DINAMIS
  // ==========================================
  const headers = useMemo(() => {
    if (tableData.length === 0) return [];
    return Object.keys(tableData[0]).filter(key => key.toLowerCase() !== 'no');
  }, [tableData]);

  // ==========================================
  // LOGIKA TOOLTIP CHART
  // ==========================================
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const sortedPayload = [...payload].sort((a, b) => b.value - a.value);

      return (
        <div className="bg-[#1E293B] border border-[#334155] p-3 rounded-lg shadow-xl min-w-[160px]">
          <p className="text-white font-black mb-2 text-sm border-b border-[#334155] pb-1">{label}</p>
          <ul className="flex flex-col gap-1.5">
            {sortedPayload.map((entry, index) => (
              <li key={`item-${index}`} className="flex items-center justify-between text-[11px] font-bold text-white">
                <div className="flex items-center">
                  <span
                    className="w-2.5 h-2.5 rounded-sm mr-2"
                    style={{ backgroundColor: entry.color }}
                  ></span>
                  <span className="uppercase">{entry.name}:</span>
                </div>
                {/* Format otomatis jadi x.xx */}
                <span className="ml-3 text-[#00A2E9]">{entry.value.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    return null;
  };

  // ==========================================
  // LOGIKA TRANSFORMASI DATA UNTUK CHART (UNIT DIKUNCI MANUAL)
  // ==========================================
  const { chartData, filteredUnits } = useMemo(() => {
    if (!chartRawData || chartRawData.length === 0) return { chartData: [], filteredUnits: [] };

    // KUNCI MANUAL: Tulis nama unit yang HANYA ingin kamu tampilkan di dalam grafik
    const allowedUnits = [
      "TEMBILAHAN", "KUALA ENOK", "BAGAN BATU", "TANJUNG BALAI KARIMUN",
      "BENGKALIS", "TALUK KUANTAN", "KAMPAR", "RENGAT KOTA", "RUMBAI", "NATUNA"
    ];

    const groupedByMonth = {};
    const monthOrder = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    chartRawData.forEach(item => {
      const unitUpper = item.unit?.toUpperCase().trim();

      // Filter: Hanya proses data jika unitnya ada di daftar allowedUnits kita
      if (allowedUnits.includes(unitUpper)) {
        const rawMonth = item.bulan || 'FEB';
        const month = rawMonth.toUpperCase().substring(0, 3);

        let rawValue = item.kom || item.persen || item['%'] || 0;

        let cleanValue = 0;
        if (typeof rawValue === 'string') {
          cleanValue = parseFloat(rawValue.replace('%', '').replace(',', '.'));
        } else {
          cleanValue = Number(rawValue);
        }

        // FOKUS PERUBAHAN DI SINI: Nilai dibagi 100 agar tampilannya menjadi format x.xx
        const scaledValue = cleanValue / 100;

        if (!groupedByMonth[month]) {
          groupedByMonth[month] = { name: month };
        }
        groupedByMonth[month][unitUpper] = isNaN(scaledValue) ? 0 : scaledValue;
      }
    });

    const chartArray = Object.values(groupedByMonth).sort((a, b) => {
      return monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name);
    });

    // Lempar allowedUnits ke return
    return { chartData: chartArray, filteredUnits: allowedUnits };
  }, [chartRawData]);

  // Array warna akan otomatis diulang-ulang (loop)
  const lineColors = ['#00A2E9', '#00D8B6', '#E91E63', '#FFC107', '#FF5252', '#FF9800', '#9C27B0', '#4CAF50', '#8BC34A', '#00BCD4'];

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

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">

      {/* CHART SECTION */}
      {chartData.length > 0 && (
        <div className="w-full bg-[#3B52A4] rounded-2xl p-6 shadow-md border border-[#2D4185] mb-8">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h3 className="text-[#00A2E9] text-xs font-black uppercase tracking-wider ">Persentase (%) KOM</h3>
              <h2 className="text-white text-xl font-black uppercase bg-white/10 px-2 py-1 rounded">Tren Realisasi ULP Pilihan</h2>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff20" />
                <XAxis
                  dataKey="name"
                  stroke="#ffffff80"
                  tick={{ fill: '#ffffff', fontSize: 11, fontWeight: 'bold' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#ffffff80"
                  tick={{ fill: '#ffffff', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 'auto']}
                  allowDataOverflow={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff40', strokeWidth: 1 }} />
                <Legend
                  wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }}
                  iconType="circle"
                />
                {filteredUnits.map((unit, index) => (
                  <Line
                    key={unit}
                    type="monotone"
                    dataKey={unit}
                    name={unit}
                    stroke={lineColors[index % lineColors.length]}
                    strokeWidth={3}
                    dot={{ r: 4, fill: lineColors[index % lineColors.length] }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    connectNulls={true}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        <div className="p-5 border-b border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-black text-[#0F172A] tracking-tight">Rincian Realisasi Transaksi ULP KOM</h2>
            <p className="text-sm text-[#64748B] font-medium mt-1">
              Menampilkan <span className="font-bold text-[#0F172A]">{sortedData.length > 0 ? indexOfFirstItem + 1 : 0} - {Math.min(indexOfLastItem, sortedData.length)}</span> dari <span className="font-bold text-[#0F172A]">{sortedData.length}</span> data
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F8FAFC] text-[#64748B] uppercase text-xs font-black border-b border-[#E2E8F0]">
              <tr>
                <th className="px-3 py-3 w-12 text-center">No</th>

                {headers.map((headerKey, index) => {
                  const normalizedKey = headerKey.toLowerCase().replace(/_/g, ' ').trim();

                  const isCenterColumn = normalizedKey.includes('%') || normalizedKey.includes('persen') ||
                    normalizedKey.includes('kom') || normalizedKey.includes('rank') ||
                    normalizedKey.includes('target') || normalizedKey.includes('real') ||
                    normalizedKey.includes('bulan');

                  // FOKUS PERUBAHAN: Hanya true jika nama kolom mengandung "unit" atau "rank"
                  const isSortableColumn = normalizedKey.includes('unit') || normalizedKey.includes('rank');

                  return (
                    <th
                      key={index}
                      // Hanya gunakan cursor-pointer dan hover color jika ini adalah kolom yang bisa di-sort
                      className={`px-3 py-3 select-none ${isSortableColumn ? 'cursor-pointer hover:text-[#00A2E9] group' : ''} ${isCenterColumn ? 'text-center' : ''}`}
                      // Hanya panggil handleSort jika ini adalah kolom yang bisa di-sort
                      onClick={isSortableColumn ? () => handleSort(headerKey) : undefined}
                    >
                      <div className={`flex items-center ${isCenterColumn ? 'justify-center' : ''}`}>
                        {headerKey.replace(/_/g, ' ')}
                        {/* Hanya render SortIcon jika ini adalah kolom yang bisa di-sort */}
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
                  <td colSpan={headers.length + 1} className="px-6 py-12 text-center text-[#64748B]">Data tidak tersedia</td>
                </tr>
              ) : (
                currentItems.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-3 py-3 font-bold text-[#0F172A] font-medium text-center">{indexOfFirstItem + idx + 1}</td>

                    {headers.map((headerKey, cellIdx) => {
                      const normalizedKey = headerKey.toLowerCase().replace(/_/g, ' ').trim();

                      const isKomColumn = normalizedKey.includes('%') || normalizedKey.includes('persen') || (normalizedKey.includes('kom') && !normalizedKey.includes('target') && !normalizedKey.includes('real'));
                      const isRankColumn = normalizedKey.includes('rank');
                      const isBulanColumn = normalizedKey.includes('bulan');

                      const rawValue = row[headerKey];
                      const stringValue = String(rawValue ?? '').replace(',', '.').replace('%', '').trim();
                      const numericValue = Number(stringValue);
                      const isValidNumber = stringValue !== '' && !isNaN(numericValue);

                      let tdClass = "px-3 py-3 text-[#475569]";
                      let content = rawValue ?? '-';

                      if (isKomColumn && isValidNumber) {
                        tdClass = `px-3 py-3 text-center font-black ${numericValue >= 100 ? 'bg-green-50/60 text-green-700' : 'bg-red-100 text-red-700'}`;
                        content = `${numericValue.toFixed(2)}%`;
                      }
                      else if (isRankColumn) {
                        tdClass = "px-3 py-3 text-center font-black text-[#F59E0B]";
                        content = `#${rawValue}`;
                      }
                      else if (isValidNumber && !normalizedKey.includes('unit')) {
                        tdClass = "px-3 py-3 text-center text-[#475569]";
                        content = numericValue.toLocaleString('id-ID');
                      }
                      else if (isBulanColumn) {
                        tdClass = "px-3 py-3 text-center text-[#475569]";
                      }

                      return (
                        <td key={cellIdx} className={tdClass}>
                          {content}
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