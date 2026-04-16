import React from 'react';

const PW_DETAIL    = 1080;
const PW_DASHBOARD = 1200;
const PAD          = 28;
const GAP          = 14;

// Tetap di-keep buat referensi warna dinamis kalau dibutuhkan oleh fungsi logika
const COLORS = {
  pageBg:      '#eef3fb',
  cardBg:      '#ffffff',
  cardBorder:  '#cdddf5',
  headerBg:    '#0fa89e',
  headerTxt:   '#ffffff',
  accentBar:   '#0fa89e',
  divider:     '#dde8f5',
  textPri:     '#0d2040',
  textSub:     '#5a789a',
  rowOdd:      '#f4f8fd',
  rowEven:     '#ffffff',
  zeroBg:      '#f8f9fb',
  zeroClr:     '#b0bec5',
  barColor:    '#0fa89e',
  barColorGray:'#90a8c0',
  teal:        '#3DBFBF',
  tealDark:    '#009FAF',
};

const getC = () => COLORS;

const fmt   = (v) => typeof v === 'number' ? new Intl.NumberFormat('id-ID').format(v) : (v ?? '-');
const fmtRp = (v) => typeof v === 'number'
  ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)
  : (v ?? '-');
const fmtRpS = (v) => {
  if (typeof v !== 'number') return v ?? '-';
  if (v >= 1_000_000_000) return `Rp ${(v / 1_000_000_000).toFixed(1)}M`;
  if (v >= 1_000_000)     return `Rp ${(v / 1_000_000).toFixed(0)}jt`;
  return fmtRp(v);
};
const fmtVal = (v, isCur) => isCur ? fmtRp(v) : fmt(v);

const toNum = (cell) => {
  if (typeof cell === 'number') return cell;
  if (typeof cell === 'string') {
    const n = parseFloat(cell.replace(/[^0-9.-]/g, ''));
    return isNaN(n) ? null : n;
  }
  return null;
};

const detectSheetType = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('close won') && n.includes('unit'))  return 'cwUnit';
  if (n.includes('close won') && n.includes('sales')) return 'cwSales';
  if (n.includes('kegiatan') && n.includes('unit'))   return 'kgUnit';
  if (n.includes('kegiatan') && n.includes('sales'))  return 'kgSales';
  return 'unknown';
};

const formatCell = (cell, ci, sheetType) => {
  if (cell == null || cell === '') return '-';
  const needsFormat = (() => {
    switch (sheetType) {
      case 'cwUnit':   return ci >= 2 && ci <= 4;
      case 'cwSales':  return ci >= 1 && ci <= 3;
      case 'kgUnit':   return ci >= 2 && ci <= 7;
      case 'kgSales':  return ci >= 1 && ci <= 6;
      default:         return false;
    }
  })();
  if (!needsFormat) return cell;
  const n = toNum(cell);
  if (n === null) return cell;
  switch (sheetType) {
    case 'cwUnit':   return ci === 4 ? fmtRp(n) : fmt(n);
    case 'cwSales':  return ci === 3 ? fmtRp(n) : fmt(n);
    case 'kgUnit':
    case 'kgSales':  return fmt(n);
    default:         return cell;
  }
};

const STitle = ({ label, sub }) => (
  <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-[#dde8f5]">
    <div className="w-1 h-4 bg-[#0fa89e] rounded-sm shrink-0" />
    <span className="text-[13px] font-extrabold text-[#0d2040] tracking-tight">{label}</span>
    {sub && <span className="text-[10px] text-[#5a789a] font-normal">{sub}</span>}
  </div>
);

const BarSection = ({ chartData, isCurrency, C, cardW }) => {
  if (!chartData?.length) return null;
  const max       = Math.max(...chartData.map(d => d.value || 0), 1);
  const cardInner = cardW - 28;
  const LABEL_PCT = '42%';
  const VAL_W     = isCurrency ? 108 : 68;
  const BAR_MAX   = Math.floor(cardInner * (1 - 0.42)) - VAL_W - 10;
  return (
    <>
      <STitle label="Grafik" />
      <table className="w-full border-collapse table-fixed">
        <colgroup>
          <col style={{ width: LABEL_PCT }} />
          <col />
          <col style={{ width: VAL_W }} />
        </colgroup>
        <tbody>
          {chartData.map((item, i) => {
            const isZ  = !item.value || item.value === 0;
            const pct  = isZ ? 0 : Math.min(1, item.value / max);
            const barW = isZ ? 2 : Math.max(2, Math.round(pct * BAR_MAX));
            const barC = isZ ? C.barColorGray : (item.color || C.barColor);
            return (
              <tr key={i} className="border-b border-[#dde8f5]" style={{ backgroundColor: i % 2 === 0 ? C.rowOdd : C.rowEven }}>
                <td className="py-[5px] px-2 text-[9.5px] font-semibold truncate" style={{ color: isZ ? C.zeroClr : C.textPri }}>{item.name}</td>
                <td className="py-[5px] pr-[6px] align-middle overflow-hidden">
                  <div className="h-[11px] rounded-r max-w-full" style={{ width: barW, backgroundColor: barC }} />
                </td>
                <td className="py-[5px] pl-1 pr-2 text-[9px] font-bold text-right whitespace-nowrap" style={{ color: isZ ? C.zeroClr : C.barColor }}>{fmtVal(item.value, isCurrency)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

const RekapSection = ({ rekapData, isCurrency, rowLabel, valueLabel, C }) => {
  if (!rekapData?.length) return null;
  const VAL_W = isCurrency ? 118 : 78;
  return (
    <>
      <STitle label="Rekap" />
      <table className="w-full border-collapse table-fixed">
        <colgroup><col /><col style={{ width: VAL_W }} /></colgroup>
        <thead>
          <tr className="bg-[#0fa89e]">
            <th className="py-[7px] px-[10px] text-[10px] font-bold text-white text-left border-r border-white/15">{rowLabel}</th>
            <th className="py-[7px] px-[10px] text-[10px] font-bold text-white text-right">{valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rekapData.map((item, i) => {
            const isZ       = !item.value || item.value === 0;
            const isHeader  = item.isHeader || false;
            const unitColor = item.color && isHeader ? item.color : null;
            const rowBg     = isHeader && unitColor ? unitColor : isZ ? C.zeroBg : i % 2 === 0 ? C.rowOdd : C.rowEven;
            const rowClr    = isHeader && unitColor ? '#ffffff' : isZ ? C.zeroClr : C.textPri;
            return (
              <tr key={i} className="border-t border-[#dde8f5]" style={{ backgroundColor: rowBg }}>
                <td className="py-[5px] px-[10px] text-[9.5px] border-r border-[#dde8f5] truncate" style={{ fontWeight: isHeader ? 700 : 500, color: rowClr }}>{item.name}</td>
                <td className="py-[5px] px-[10px] text-[9.5px] font-bold text-right whitespace-nowrap" style={{ color: rowClr }}>{fmtVal(item.value, isCurrency)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

const TableSection = ({ headers, data, name, checkAllZero, isUP3Row, getUP3Color, C }) => {
  if (!data?.length || !headers?.length) return null;
  const sheetType = detectSheetType(name);
  const maxCols   = Math.min(headers.length, 9);
  const visH      = headers.slice(0, maxCols);
  return (
    <div className="mt-[22px]">
      <STitle label="Tabel Detail" sub={`(${data.length} baris)`} />
      <table className="w-full border-collapse table-fixed">
        <colgroup>
          <col className="w-[30px]" />
          {visH.map((_, i) => <col key={i} />)}
        </colgroup>
        <thead>
          <tr className="bg-[#0fa89e]">
            <th className="py-[6px] px-1 text-[9px] font-bold text-white text-center border-r border-white/15">No</th>
            {visH.map((h, i) => (
              <th key={i} className={`py-[6px] px-[6px] text-[9px] font-bold text-white text-left truncate ${i < visH.length - 1 ? 'border-r border-white/15' : ''}`}>
                {h || `Col ${i + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => {
            const isZero = checkAllZero ? checkAllZero(row) : false;
            const isUp3  = isUP3Row ? isUP3Row(row) : false;
            const up3Clr = isUp3 && getUP3Color ? getUP3Color(row) : null;
            const rowBg  = isUp3 && up3Clr ? up3Clr : isZero ? C.zeroBg : ri % 2 === 0 ? C.rowOdd : C.rowEven;
            const rowClr = isUp3 ? '#ffffff' : isZero ? C.zeroClr : C.textPri;
            return (
              <tr key={ri} className="border-t border-[#dde8f5]" style={{ backgroundColor: rowBg }}>
                <td className="p-1 text-[8.5px] text-center border-r border-[#dde8f5]" style={{ color: isUp3 ? 'rgba(255,255,255,0.6)' : C.textSub }}>{isUp3 ? '' : ri + 1}</td>
                {row.slice(0, maxCols).map((cell, ci) => (
                  <td key={ci} className={`py-1 px-[6px] text-[9px] truncate ${ci < maxCols - 1 ? 'border-r border-[#dde8f5]' : ''}`} style={{ color: rowClr }}>
                    {formatCell(cell, ci, sheetType)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const StatCard = ({ label, value, sub, accent, C }) => (
  <div className="flex-1 bg-white border border-[#cdddf5] rounded-[14px] py-4 px-[18px] box-border shadow-sm min-w-0">
    {sub && (
      <div className="inline-block mb-2 text-[9px] font-bold rounded-full py-[2px] px-2" style={{ color: accent || C.teal, backgroundColor: `${accent || C.teal}18`, border: `1px solid ${accent || C.teal}40` }}>
        {sub}
      </div>
    )}
    <div className="text-[9.5px] text-[#5a789a] mb-[3px]">{label}</div>
    <div className="text-[15px] font-extrabold text-[#0d2040] leading-tight">{value}</div>
  </div>
);

const SecHead = ({ title, sub }) => (
  <div className="flex items-center gap-[10px] mb-[10px]">
    <div className="w-[26px] h-[26px] rounded-[7px] shrink-0 bg-[#3DBFBF22] flex items-center justify-center">
      <div className="w-[9px] h-[9px] bg-[#3DBFBF] rounded-sm" />
    </div>
    <div>
      <div className="text-[11px] font-extrabold text-[#0d2040]">{title}</div>
      {sub && <div className="text-[9px] text-[#5a789a] mt-[1px]">{sub}</div>}
    </div>
  </div>
);

const DonutUP3 = ({ up3Data, C }) => {
  if (!up3Data?.length) return null;
  const total = up3Data.reduce((s, d) => s + d.value, 0);
  if (!total) return null;
  const SIZE = 110, CX = 55, CY = 55, R_OUT = 48, R_IN = 30;
  let cumA = -Math.PI / 2;
  const slices = up3Data.map(d => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const a0 = cumA; cumA += sweep; const a1 = cumA;
    const large = sweep > Math.PI ? 1 : 0;
    return { ...d, path: [`M ${CX + R_OUT * Math.cos(a0)} ${CY + R_OUT * Math.sin(a0)}`, `A ${R_OUT} ${R_OUT} 0 ${large} 1 ${CX + R_OUT * Math.cos(a1)} ${CY + R_OUT * Math.sin(a1)}`, `L ${CX + R_IN * Math.cos(a1)} ${CY + R_IN * Math.sin(a1)}`, `A ${R_IN} ${R_IN} 0 ${large} 0 ${CX + R_IN * Math.cos(a0)} ${CY + R_IN * Math.sin(a0)}`, 'Z'].join(' ') };
  });
  return (
    <div className="flex items-center gap-[14px] py-1">
      <svg width={SIZE} height={SIZE} className="shrink-0">
        {slices.map((s, i) => <path key={i} d={s.path} fill={s.color} />)}
      </svg>
      <div className="flex-1 flex flex-col gap-1.5">
        {up3Data.map(d => (
          <div key={d.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
            <div>
              <div className="text-[9px] font-semibold text-[#0d2040]">{d.name}</div>
              <div className="text-[8.5px] text-[#5a789a]">{fmtRpS(d.value)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BarTableGeneric = ({ data, max, color, isCurrency, labelPct, valW, barMaxPx, rankMode, rowH }) => {
  if (!data?.length) return null;
  const C = getC();
  return (
    <table className="w-full border-collapse table-fixed">
      <colgroup>
        {rankMode && <col className="w-5" />}
        <col style={{ width: labelPct }} />
        <col />
        <col style={{ width: valW }} />
      </colgroup>
      <tbody>
        {data.map((item, i) => {
          const isZ    = !item.value || item.value === 0;
          const pct    = isZ ? 0 : Math.min(1, item.value / max);
          const barW   = isZ ? 2 : Math.max(2, Math.round(pct * barMaxPx));
          const barC   = isZ ? C.barColorGray : (item.color || color);
          const isHdr  = item.isHeader || false;
          const rowBg  = isHdr ? (item.color || color) : isZ ? C.zeroBg : i % 2 === 0 ? C.rowOdd : C.rowEven;
          const rowClr = isHdr ? '#ffffff' : isZ ? C.zeroClr : C.textPri;
          const pySize = rowH === 'sm' ? 'py-[3px]' : 'py-[5px]';
          return (
            <tr key={i} className="border-b border-[#dde8f5]" style={{ backgroundColor: rowBg }}>
              {rankMode && (
                <td className={`${pySize} pl-[6px] pr-1 text-[8.5px] font-bold text-right`} style={{ color: isHdr ? 'rgba(255,255,255,0.7)' : C.textSub }}>{isHdr ? '' : i + 1}</td>
              )}
              <td className={`${pySize} pl-[6px] pr-2 text-[9px] truncate`} style={{ fontWeight: isHdr ? 700 : 500, color: rowClr }}>{item.name}</td>
              <td className={`${pySize} pl-0 pr-1 align-middle overflow-hidden`}>
                <div className={`rounded-r max-w-full ${rowH === 'sm' ? 'h-[7px]' : 'h-[10px]'}`} style={{ width: barW, backgroundColor: barC }} />
              </td>
              <td className={`${pySize} pl-1 pr-2 text-[8.5px] font-bold text-right whitespace-nowrap`} style={{ color: rowClr }}>
                {isCurrency ? (rowH === 'sm' ? fmtRpS(item.value) : fmtRp(item.value)) : fmt(item.value)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const TopOfMonthTable = ({ allMonthsTop, C }) => {
  if (!allMonthsTop?.length) return null;

  const ROWS = [
    { key: 'topSales',    label: 'Top Revenue',  getName: (m) => m.topSales?.name    || '-', getValue: (m) => m.topSales    ? fmtRpS(m.topSales.revenue)     : '-' },
    { key: 'topActive',   label: 'Most Active',  getName: (m) => m.topActive?.name   || '-', getValue: (m) => m.topActive   ? `${m.topActive.count} kegiatan` : '-' },
    { key: 'topCustomer', label: 'Top Customer', getName: (m) => m.topCustomer?.name || '-', getValue: (m) => m.topCustomer ? fmtRpS(m.topCustomer.revenue)   : '-' },
  ];

  const COL_LABEL = 110;
  const COL_MONTH = Math.floor((PW_DASHBOARD - PAD * 2 - 28 - COL_LABEL) / allMonthsTop.length);

  return (
    <div className="mb-[14px]">
      <SecHead title="Top of the Month — Rekap per Bulan" />
      <table className="w-full border-collapse table-fixed">
        <colgroup>
          <col style={{ width: COL_LABEL }} />
          {allMonthsTop.map((_, i) => <col key={i} style={{ width: COL_MONTH }} />)}
        </colgroup>
        <thead>
          <tr className="bg-[#0fa89e]">
            <th className="py-[7px] px-[10px] text-[10px] font-bold text-white text-left border-r border-white/15">Kategori</th>
            {allMonthsTop.map((m, i) => (
              <th key={i} className={`py-[7px] px-[10px] text-[10px] font-bold text-white text-center ${i < allMonthsTop.length - 1 ? 'border-r border-white/15' : ''}`}>
                {m.monthLabel} {m.year}
              </th>
            ))}
          </tr>
          <tr className="bg-[#3DBFBF22] border-b border-[#dde8f5]">
            <th className="py-[5px] px-[10px] text-[9px] font-semibold text-[#5a789a] text-left border-r border-[#dde8f5]">—</th>
            {allMonthsTop.map((m, i) => (
              <th key={i} className={`py-[5px] px-[10px] text-[9px] font-semibold text-[#5a789a] text-center ${i < allMonthsTop.length - 1 ? 'border-r border-[#dde8f5]' : ''}`}>
                Nama · Nilai
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, ri) => (
            <tr key={ri} className="border-b border-[#dde8f5]" style={{ backgroundColor: ri % 2 === 0 ? C.rowEven : C.rowOdd }}>
              <td className="py-[7px] px-[10px] text-[9.5px] font-bold text-[#0d2040] border-r border-[#dde8f5] whitespace-nowrap">
                {row.label}
              </td>
              {allMonthsTop.map((m, mi) => {
                const name  = row.getName(m);
                const value = row.getValue(m);
                const empty = value === '-';
                return (
                  <td key={mi} className={`py-[7px] px-[10px] text-[9px] align-top ${mi < allMonthsTop.length - 1 ? 'border-r border-[#dde8f5]' : ''}`}>
                    {empty ? (
                      <span className="text-[#b0bec5] italic">—</span>
                    ) : (
                      <>
                        <div className="font-bold text-[#0d2040] text-[9px] mb-0.5 break-words leading-[1.3]">{name}</div>
                        <div className="font-bold text-[#3DBFBF] text-[9.5px]">{value}</div>
                      </>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const ExportCanvas = React.forwardRef((props, ref) => {
  const { dashboardMode } = props;
  const C = getC();
  const now = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

  if (dashboardMode) {
    const {
      totalPendapatan = 0, totalKegiatan = 0, totalSales = 0,
      topSalesCW = null, topSalesKG = null,
      up3Data = [], salesCW = [], salesKG = [], unitCW = [], unitKG = [],
      allMonthsTop = [],
    } = props;

    const PW    = PW_DASHBOARD;
    const AVAIL = PW - PAD * 2;
    const COL2  = (AVAIL - GAP) / 2;
    const INNER = COL2 - 28;

    const maxSalesCW = salesCW[0]?.value || 1;
    const maxSalesKG = salesKG[0]?.value || 1;
    const maxUnitCW  = unitCW[0]?.value  || 1;
    const maxUnitKG  = unitKG[0]?.value  || 1;

    const SALES_LABEL_W    = Math.floor(INNER * 0.36);
    const SALES_VAL_CW     = 108;
    const SALES_VAL_KG     = 50;
    const SALES_BAR_MAX_CW = Math.max(30, INNER - 20 - SALES_LABEL_W - SALES_VAL_CW - 20);
    const SALES_BAR_MAX_KG = Math.max(30, INNER - 20 - SALES_LABEL_W - SALES_VAL_KG - 20);

    const UNIT_LABEL_W    = Math.floor(INNER * 0.40);
    const UNIT_VAL_CW     = 70;
    const UNIT_VAL_KG     = 46;
    const UNIT_BAR_MAX_CW = Math.max(30, INNER - UNIT_LABEL_W - UNIT_VAL_CW - 10);
    const UNIT_BAR_MAX_KG = Math.max(30, INNER - UNIT_LABEL_W - UNIT_VAL_KG - 10);

    const cardClasses = "bg-white border border-[#cdddf5] rounded-[14px] pt-[14px] px-[14px] pb-3 box-border shadow-sm";

    return (
      <div ref={ref} className="bg-[#eef3fb] box-border" style={{ width: PW, padding: PAD, fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif' }}>
        
        {/* ── Header ── */}
        <div className="flex justify-between items-end mb-4 pb-3 border-b-2 border-[#dde8f5]">
          <div>
            <div className="text-[22px] font-black text-[#0d2040] tracking-tight">Dashboard</div>
            <div className="text-[10px] text-[#5a789a] mt-[3px]">Ringkasan performa CRM  •  Dicetak: {now}</div>
          </div>
          <div className="text-[9.5px] font-bold text-[#5a789a] bg-white border-[1.5px] border-[#cdddf5] rounded-[7px] py-[5px] px-3">CRM Monitor</div>
        </div>

        {/* ── 1. Stat Cards + Donut UP3 ── */}
        <div className="flex gap-[14px] mb-[14px]">
          <div className="flex-[3] grid grid-cols-2 gap-[14px]">
            <StatCard label="Total Pendapatan BP"   value={fmtRp(totalPendapatan)}   sub={`${totalSales} sales`} accent={C.teal}     C={C} />
            <StatCard label="Total Kegiatan"        value={fmt(totalKegiatan)}        sub={`${totalSales} sales`} accent={C.tealDark} C={C} />
            <StatCard label="Top Sales (Pendapatan)" value={topSalesCW?.name || '—'}   sub={topSalesCW ? fmtRpS(topSalesCW.value) : ''} accent="#009FAF" C={C} />
            <StatCard label="Top Sales (Kegiatan)"   value={topSalesKG?.name || '—'}   sub={topSalesKG ? fmt(topSalesKG.value) : ''}    accent="#7FAEC0" C={C} />
          </div>
          {up3Data.length > 0 && (
            <div className={`flex-[2] ${cardClasses}`}>
              <SecHead title="Kontribusi per UP3" sub="Berdasarkan Pendapatan BP" />
              <DonutUP3 up3Data={up3Data} C={C} />
            </div>
          )}
        </div>

        {/* ── 2. Top of the Month ── */}
        {allMonthsTop.length > 0 && (
          <div className={`mb-[14px] ${cardClasses}`}>
            <TopOfMonthTable allMonthsTop={allMonthsTop} C={C} />
          </div>
        )}

        {/* ── 3. Close Won & Kegiatan per Sales ── */}
        {(salesCW.length > 0 || salesKG.length > 0) && (
          <div className="flex gap-[14px] mb-[14px]">
            {salesCW.length > 0 && (
              <div className={`flex-1 min-w-0 ${cardClasses}`}>
                <SecHead title="Close Won per Sales" sub={`${salesCW.length} sales`} />
                <BarTableGeneric data={salesCW} max={maxSalesCW} color={C.teal} isCurrency={true}  labelPct="36%" valW={SALES_VAL_CW} barMaxPx={SALES_BAR_MAX_CW} rankMode={true} rowH="sm" />
              </div>
            )}
            {salesKG.length > 0 && (
              <div className={`flex-1 min-w-0 ${cardClasses}`}>
                <SecHead title="Kegiatan Pemasaran per Sales" sub={`${salesKG.length} sales`} />
                <BarTableGeneric data={salesKG} max={maxSalesKG} color="#2E7DD4" isCurrency={false} labelPct="36%" valW={SALES_VAL_KG} barMaxPx={SALES_BAR_MAX_KG} rankMode={true} rowH="sm" />
              </div>
            )}
          </div>
        )}

        {/* ── 4. Close Won & Kegiatan per Unit ── */}
        {(unitCW.length > 0 || unitKG.length > 0) && (
          <div className="flex gap-[14px] mb-[14px]">
            {unitCW.length > 0 && (
              <div className={`flex-1 min-w-0 ${cardClasses}`}>
                <SecHead title="Close Won per Unit" sub={`${unitCW.length} ULP`} />
                <BarTableGeneric data={unitCW} max={maxUnitCW} color={C.teal} isCurrency={true}  labelPct="40%" valW={UNIT_VAL_CW} barMaxPx={UNIT_BAR_MAX_CW} rankMode={false} rowH="md" />
              </div>
            )}
            {unitKG.length > 0 && (
              <div className={`flex-1 min-w-0 ${cardClasses}`}>
                <SecHead title="Kegiatan Pemasaran per Unit" sub={`${unitKG.length} ULP`} />
                <BarTableGeneric data={unitKG} max={maxUnitKG} color={C.teal} isCurrency={false} labelPct="40%" valW={UNIT_VAL_KG} barMaxPx={UNIT_BAR_MAX_KG} rankMode={false} rowH="md" />
              </div>
            )}
          </div>
        )}

      </div>
    );
  }

  // ── Detail mode (non-dashboard) ────────────────────────────
  const {
    name         = '',
    chartData    = [],
    rekapData    = [],
    tableHeaders = [],
    tableData    = [],
    isCurrency   = false,
    rowLabel     = 'Nama',
    valueLabel   = 'Nilai',
    checkAllZero,
    isUP3Row,
    getUP3Color,
  } = props;

  const PW     = PW_DETAIL;
  const INNER  = PW - PAD * 2;
  const CHART_W = Math.floor((INNER - GAP) * 0.55);
  const REKAP_W = INNER - GAP - CHART_W;
  const hasTop  = chartData.length > 0 || rekapData.length > 0;

  return (
    <div ref={ref} className="bg-[#eef3fb] box-border pb-10" style={{ width: PW, padding: `${PAD}px ${PAD}px 40px`, fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif' }}>
      <div className="flex justify-between items-start mb-[18px] pb-[13px] border-b-2 border-[#dde8f5]">
        <div>
          <div className="text-[20px] font-black text-[#0d2040] tracking-tight leading-tight">{name}</div>
          <div className="text-[10px] text-[#5a789a] mt-[5px]">
            {chartData.length > 0 && `${chartData.length} entri`}
            {chartData.length > 0 && tableData.length > 0 && '  •  '}
            {tableData.length > 0 && `${tableData.length} baris detail`}
            {'  •  Dicetak: '}{now}
          </div>
        </div>
        <div className="text-[9.5px] font-bold text-[#5a789a] bg-white border-[1.5px] border-[#cdddf5] rounded-[7px] py-[5px] px-3 shrink-0">CRM Monitor</div>
      </div>

      {hasTop && (
        <div className="flex gap-[14px] items-start">
          {chartData.length > 0 && (
            <div className="shrink-0 bg-white border-[1.5px] border-[#cdddf5] rounded-xl overflow-hidden pt-[14px] px-[14px] pb-3 box-border" style={{ width: CHART_W }}>
              <BarSection chartData={chartData} isCurrency={isCurrency} C={C} cardW={CHART_W} />
            </div>
          )}
          {rekapData.length > 0 && (
            <div className="shrink-0 bg-white border-[1.5px] border-[#cdddf5] rounded-xl overflow-hidden pt-[14px] px-[14px] pb-3 box-border" style={{ width: REKAP_W }}>
              <RekapSection rekapData={rekapData} isCurrency={isCurrency} rowLabel={rowLabel} valueLabel={valueLabel} C={C} />
            </div>
          )}
        </div>
      )}

      <TableSection
        headers={tableHeaders}
        data={tableData}
        name={name}
        checkAllZero={checkAllZero}
        isUP3Row={isUP3Row}
        getUP3Color={getUP3Color}
        C={C}
      />
    </div>
  );
});

ExportCanvas.displayName = 'ExportCanvas';
export default ExportCanvas;