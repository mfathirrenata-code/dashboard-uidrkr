import React, { useState, useMemo } from 'react';
import {
  Layers, BarChart3, Activity,
  ChevronLeft, ChevronRight, ArrowUpDown, Search,
  TrendingUp, ArrowLeftRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import { getTokens } from '../shared/ThemeTokens';

export const fmt     = (n) => new Intl.NumberFormat('id-ID').format(Math.round(n ?? 0));
export const fmtMWh  = (n) => `${fmt(n)} MWh`;
export const BULAN_LABEL = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
export const BULAN_FULL  = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const PAGE_SIZE = 12;

export const TOOLTIP_STYLE = {
  fontSize: 11, borderRadius: 8,
  background: '#0F172A', border: '1px solid rgba(255,255,255,0.15)', color: '#FFFFFF',
};
export const TOOLTIP_LABEL_STYLE = { color: '#FFFFFF', fontWeight: 700, marginBottom: 4 };

// ── Warna per tahun — SAMA dengan Dashboard KTT ───────────────────────────────
export const YEAR_PALETTE = [
  '#E67E22', // orange
  '#2980B9', // biru
  '#27AE60', // hijau
  '#8E44AD', // ungu
  '#C0392B', // merah
  '#16A085', // teal
  '#F39C12', // kuning
];

export const pct = (curr, prev) => {
  if (!prev || prev === 0) return null;
  return ((curr - prev) / prev) * 100;
};

const fmtPct = (val) => {
  if (val === null || val === undefined) return '—';
  const sign = val >= 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
};

export const PctBadge = ({ val, t }) => {
  if (val === null || val === undefined) return <span style={{ color: t.textSub, fontSize: 11 }}>—</span>;
  const isUp   = val >= 0;
  const bg     = isUp ? '#27AE6014' : '#E74C3C14';
  const color  = isUp ? '#27AE60'   : '#E74C3C';
  const border = isUp ? '1px solid #27AE6030' : '1px solid #E74C3C30';
  return (
    <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-bold"
      style={{ background: bg, color, border }}>
      {fmtPct(val)}
    </span>
  );
};

export const buildLookup = (data) => {
  const m = {};
  data.forEach(d => {
    if (!m[d.tahun]) m[d.tahun] = {};
    m[d.tahun][d.bulan] = d;
  });
  return m;
};

export const buildKum = (allTahun, lookup) => {
  const m = {};
  allTahun.forEach(yr => {
    m[yr] = {};
    let running = 0;
    let hasAny  = false;
    for (let b = 1; b <= 12; b++) {
      const val = lookup[yr]?.[b]?.total || 0;
      if (val > 0) hasAny = true;
      running += val;
      m[yr][b] = hasAny ? running : null;
    }
  });
  return m;
};

// ── Shared UI ─────────────────────────────────────────────────────────────────

export const Card = ({ children, className = '', style = {} }) => {
  const t = getTokens();
  return (
    <div className={`rounded-2xl p-5 ${className}`}
      style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', ...style }}>
      {children}
    </div>
  );
};

export const SectionHead = ({ icon: Icon, title, subtitle, color }) => {
  const t = getTokens();
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: color ? color + '22' : t.iconBg }}>
        <Icon className="w-4 h-4" style={{ color: color || t.accentColor }} />
      </div>
      <div>
        <h2 className="text-sm font-bold leading-none" style={{ color: t.textPrimary }}>{title}</h2>
        {subtitle && <p className="text-[10px] mt-0.5" style={{ color: t.textSub }}>{subtitle}</p>}
      </div>
    </div>
  );
};

export const Dropdown = ({ value, onChange, options, label }) => {
  const t = getTokens();
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs font-medium" style={{ color: t.textSub }}>{label}</span>}
      <select value={value} onChange={e => onChange(e.target.value)}
        className="text-xs font-semibold rounded-lg px-3 py-1.5 outline-none"
        style={{ background: t.iconBg, border: `1px solid ${t.btnBorder}`, color: t.textPrimary, cursor: 'pointer' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
};

export const PageHeader = ({ icon: Icon, title, subtitle, color }) => {
  const t = getTokens();
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: color + '22', border: `1px solid ${color}44` }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div>
        <h1 className="text-2xl font-bold" style={{ color: t.textPrimary }}>{title}</h1>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: t.textSub }}>{subtitle}</p>}
      </div>
    </div>
  );
};

export const renderLegend = (t) => ({ payload }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 16px', marginTop: 8 }}>
    {payload.map((entry) => (
      <div key={entry.value} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 10, height: 10, borderRadius: 2, background: entry.color, flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: t.textPrimary, fontWeight: 600 }}>{entry.value}</span>
      </div>
    ))}
  </div>
);

export const StatCard = ({ label, value, sub, delta, t, color }) => (
  <div style={{
    flex: '1 1 150px', minWidth: 140,
    background: t.cardBg, border: `1px solid ${t.cardBorder}`,
    borderRadius: 14, padding: '14px 16px',
  }}>
    <p style={{ fontSize: 10, color: t.textSub, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    <p style={{ fontSize: 18, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{value}</p>
    {sub   && <p style={{ fontSize: 10, color: t.textSub, marginTop: 4 }}>{sub}</p>}
    {delta !== undefined && <div style={{ marginTop: 6 }}><PctBadge val={delta} t={t} /></div>}
  </div>
);

export const thBase = (t) => ({
  padding: '9px 10px', textAlign: 'right', fontSize: 11,
  fontWeight: 700, color: t.textSub, background: t.rowEven, whiteSpace: 'nowrap',
});

// ── Helper: hollow dot factories ──────────────────────────────────────────────

const makeHollowDot = (color, cardBg) => (props) => {
  const { cx, cy, value } = props;
  if (value == null || cx == null || cy == null) return null;
  return <circle cx={cx} cy={cy} r={4} stroke={color} strokeWidth={2} fill={cardBg} />;
};

const makeHollowActiveDot = (color, cardBg) => (props) => {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return <circle cx={cx} cy={cy} r={6} stroke={color} strokeWidth={2} fill={cardBg} />;
};

// ── Helper: Y-axis formatter ──────────────────────────────────────────────────

const fmtYAxis = (v) => {
  if (v === 0) return '0';
  if (v >= 1000) return `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`;
  return v;
};

// ═══════════════════════════════════════════════════════════════════════════════
// 1. TABEL DATA BULANAN
// ═══════════════════════════════════════════════════════════════════════════════
export const TabelBulanan = ({ data, color, label }) => {
  const t = getTokens();
  const allTahun = [...new Set(data.map(d => d.tahun))].sort((a, b) => b - a);
  const [selectedTahun, setSelectedTahun] = useState(String(allTahun[0] ?? 'all'));
  const [sortKey,       setSortKey]       = useState('bulan');
  const [sortAsc,       setSortAsc]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [page,          setPage]          = useState(0);
  const [expandedRows,  setExpandedRows]  = useState(new Set());

  const tahunOpts = [
    { value: 'all', label: 'Semua Tahun' },
    ...allTahun.map(y => ({ value: String(y), label: String(y) })),
  ];

  const toggleExpand = (key) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let rows = selectedTahun === 'all'
      ? data
      : data.filter(d => d.tahun === parseInt(selectedTahun));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(d =>
        d.bulanStr?.toLowerCase().includes(q) ||
        String(d.tahun).includes(q) ||
        d.justYoY?.toLowerCase().includes(q) ||
        d.justMtM?.toLowerCase().includes(q)
      );
    }
    return [...rows].sort((a, b) => {
      const av = a[sortKey] ?? 0;
      const bv = b[sortKey] ?? 0;
      if (typeof av === 'string') return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortAsc ? av - bv : bv - av;
    });
  }, [data, selectedTahun, search, sortKey, sortAsc]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged      = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc(p => !p);
    else { setSortKey(key); setSortAsc(true); }
    setPage(0);
  };

  const ThBtn = ({ k, label: lbl }) => (
    <button onClick={() => toggleSort(k)}
      className="flex items-center gap-1 text-left"
      style={{ color: sortKey === k ? color : t.textSub, fontWeight: 700, fontSize: 11 }}>
      {lbl}
      <ArrowUpDown className="w-3 h-3" style={{ opacity: sortKey === k ? 1 : 0.4 }} />
    </button>
  );

  const yearSummary = useMemo(() => {
    const rows = selectedTahun === 'all' ? [] : data.filter(d => d.tahun === parseInt(selectedTahun));
    if (!rows.length) return null;
    return {
      totalMWh:  rows.reduce((s, d) => s + d.total, 0),
      avgRerata: rows.reduce((s, d) => s + d.rerata, 0) / rows.length,
      months:    rows.length,
    };
  }, [data, selectedTahun]);

  const TOTAL_COLS = 38;

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <SectionHead icon={Layers} title={`Data Bulanan – ${label}`}
          subtitle="Klik baris untuk lihat data harian (Tgl 1–31)" color={color} />
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: t.iconBg, border: `1px solid ${t.btnBorder}` }}>
            <Search className="w-3.5 h-3.5" style={{ color: t.textSub }} />
            <input type="text" placeholder="Cari..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(0); }}
              className="text-xs outline-none bg-transparent w-24" style={{ color: t.textPrimary }} />
          </div>
          <Dropdown value={selectedTahun}
            onChange={v => { setSelectedTahun(v); setPage(0); setExpandedRows(new Set()); }}
            options={tahunOpts} label="Tahun:" />
        </div>
      </div>

      {yearSummary && (
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { label: 'Total MWh',              value: fmtMWh(yearSummary.totalMWh)  },
            { label: 'Rata-rata Rerata Harian', value: fmtMWh(yearSummary.avgRerata) },
            { label: 'Bulan Tercatat',          value: `${yearSummary.months} bulan` },
          ].map(p => (
            <div key={p.label} className="text-xs px-3 py-1.5 rounded-full font-semibold"
              style={{ background: color + '18', color, border: `1px solid ${color}44` }}>
              {p.label}: <span className="font-bold">{p.value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
          <thead>
            <tr style={{ background: t.rowEven }}>
              <th style={{ width: 32, padding: '9px 6px' }} />
              <th style={{ padding: '9px 12px', textAlign: 'left', minWidth: 90 }}>
                <ThBtn k="bulan" label="Bulan" />
              </th>
              {Array.from({ length: 31 }, (_, i) => (
                <th key={i + 1} style={{ padding: '9px 5px', textAlign: 'right', minWidth: 50, fontSize: 10, color: t.textSub, fontWeight: 700 }}>
                  {i + 1}
                </th>
              ))}
              <th style={{ padding: '9px 12px', textAlign: 'right', minWidth: 110 }}>
                <div className="flex justify-end"><ThBtn k="total" label="Total" /></div>
              </th>
              <th style={{ padding: '9px 12px', textAlign: 'right', minWidth: 110 }}>
                <div className="flex justify-end"><ThBtn k="rerata" label="Rerata/Hari" /></div>
              </th>
              <th style={{ padding: '9px 10px', textAlign: 'right', minWidth: 55 }}>
                <div className="flex justify-end"><ThBtn k="jumlahHari" label="Hari" /></div>
              </th>
              <th style={{ padding: '9px 12px', textAlign: 'left', minWidth: 160, fontSize: 11, color: t.textSub, fontWeight: 700 }}>
                Justifikasi YoY
              </th>
              <th style={{ padding: '9px 12px', textAlign: 'left', minWidth: 160, fontSize: 11, color: t.textSub, fontWeight: 700 }}>
                Justifikasi MtM
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={TOTAL_COLS} style={{ padding: '32px', textAlign: 'center', color: t.textSub, fontSize: 13 }}>
                  Tidak ada data
                </td>
              </tr>
            ) : paged.map((row, i) => {
              const rowKey     = `${row.tahun}-${row.bulan}`;
              const isExpanded = expandedRows.has(rowKey);
              const harianMap  = {};
              (row.harian || []).forEach(h => { harianMap[h.hari] = h.nilai; });
              const maxHarian  = Math.max(0, ...(row.harian || []).map(h => h.nilai));
              const bgRow      = i % 2 === 0 ? t.rowOdd : t.rowEven;

              return (
                <React.Fragment key={rowKey}>
                  <tr style={{ background: bgRow, borderBottom: `1px solid ${t.divider}`, cursor: 'pointer' }}
                    onClick={() => toggleExpand(rowKey)}>
                    <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 18, height: 18, borderRadius: 4,
                        background: isExpanded ? color + '22' : t.iconBg,
                        color: isExpanded ? color : t.textSub,
                        fontSize: 12, fontWeight: 700, transition: 'all .15s',
                      }}>
                        {isExpanded ? '−' : '+'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ color, fontWeight: 700, fontSize: 12 }}>{row.bulanStr}</span>
                      <span style={{ color: t.textSub, fontSize: 11, marginLeft: 4 }}>{row.tahun}</span>
                    </td>
                    {Array.from({ length: 31 }, (_, d) => {
                      const tgl = d + 1;
                      const val = harianMap[tgl];
                      return (
                        <td key={tgl} style={{ padding: '8px 5px', textAlign: 'right' }}>
                          {val != null && val > 0
                            ? <span style={{ fontSize: 10, color: t.textPrimary, fontVariantNumeric: 'tabular-nums' }}>{fmt(val)}</span>
                            : <span style={{ fontSize: 10, color: t.divider }}>—</span>}
                        </td>
                      );
                    })}
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                      <span style={{ color: t.textPrimary, fontWeight: 700, fontSize: 12 }}>{fmt(row.total)}</span>
                      <span style={{ color: t.textSub, fontSize: 10, marginLeft: 2 }}>MWh</span>
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                      <span style={{ color: t.textPrimary, fontSize: 12 }}>{fmt(row.rerata)}</span>
                      <span style={{ color: t.textSub, fontSize: 10, marginLeft: 2 }}>MWh</span>
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                      <span style={{ color: t.textSub, fontSize: 12 }}>{row.jumlahHari || '—'}</span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      {row.justYoY
                        ? <span className="inline-block text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: color + '14', color, border: `1px solid ${color}30` }}>
                            {row.justYoY}
                          </span>
                        : <span style={{ color: t.textSub, fontSize: 11 }}>—</span>}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      {row.justMtM
                        ? <span className="inline-block text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: '#27AE6014', color: '#27AE60', border: '1px solid #27AE6030' }}>
                            {row.justMtM}
                          </span>
                        : <span style={{ color: t.textSub, fontSize: 11 }}>—</span>}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr style={{ background: t.rowEven }}>
                      <td colSpan={TOTAL_COLS} style={{ padding: 0 }}>
                        <div style={{
                          borderLeft: `3px solid ${color}`,
                          marginLeft: 12, marginTop: 2, marginBottom: 6,
                          borderRadius: 8, background: t.cardBg, overflow: 'hidden',
                        }}>
                          <div style={{ padding: '6px 14px', background: color + '14', fontSize: 10, fontWeight: 700, color, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Data Harian — {row.bulanStr} {row.tahun}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 1, padding: '6px 8px 10px' }}>
                            {Array.from({ length: 31 }, (_, d) => {
                              const tgl    = d + 1;
                              const val    = harianMap[tgl];
                              const hasVal = val != null && val > 0;
                              const barPct = hasVal && maxHarian > 0 ? (val / maxHarian) * 100 : 0;
                              return (
                                <div key={tgl} style={{
                                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                                  padding: '6px 4px 4px', borderRadius: 6,
                                  background: hasVal ? color + '0A' : 'transparent',
                                  opacity: hasVal ? 1 : 0.35,
                                }}>
                                  <span style={{ fontSize: 9, fontWeight: 700, color: t.textSub, marginBottom: 3 }}>{tgl}</span>
                                  <div style={{ width: 28, height: 36, background: t.divider, borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', marginBottom: 3 }}>
                                    <div style={{ width: '100%', height: `${barPct}%`, minHeight: hasVal ? 2 : 0, background: hasVal ? color : 'transparent', borderRadius: 2 }} />
                                  </div>
                                  <span style={{ fontSize: 9, fontWeight: hasVal ? 700 : 400, color: hasVal ? t.textPrimary : t.textSub, textAlign: 'center', lineHeight: 1.2 }}>
                                    {hasVal ? fmt(val) : '—'}
                                  </span>
                                  {hasVal && <span style={{ fontSize: 8, color: t.textSub }}>MWh</span>}
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ display: 'flex', gap: 16, padding: '6px 14px 10px', borderTop: `1px solid ${t.divider}`, flexWrap: 'wrap' }}>
                            {[
                              { lbl: 'Total',       val: `${fmt(row.total)} MWh`  },
                              { lbl: 'Rerata/Hari', val: `${fmt(row.rerata)} MWh` },
                              { lbl: 'Jml Hari',    val: row.jumlahHari || '—'    },
                              { lbl: 'Hari Tert.',  val: (() => {
                                  const mx = row.harian?.reduce((a, b) => b.nilai > a.nilai ? b : a, { hari: 0, nilai: 0 });
                                  return mx?.nilai > 0 ? `Tgl ${mx.hari} (${fmt(mx.nilai)} MWh)` : '—';
                                })() },
                            ].map(s => (
                              <div key={s.lbl} style={{ fontSize: 10 }}>
                                <span style={{ color: t.textSub }}>{s.lbl}: </span>
                                <span style={{ color, fontWeight: 700 }}>{s.val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>

          {yearSummary && paged.length > 0 && (
            <tfoot>
              <tr style={{ background: t.rowEven, borderTop: `2px solid ${t.divider}` }}>
                <td colSpan={2} style={{ padding: '9px 12px', fontWeight: 700, color: t.textPrimary, fontSize: 12 }}>
                  Total {selectedTahun !== 'all' ? selectedTahun : ''}
                </td>
                <td colSpan={31} />
                <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color, fontSize: 12 }}>
                  {fmt(yearSummary.totalMWh)} MWh
                </td>
                <td style={{ padding: '9px 12px', textAlign: 'right', color: t.textSub, fontSize: 12 }}>
                  {fmt(yearSummary.avgRerata)} MWh
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: `1px solid ${t.divider}` }}>
          <span className="text-xs" style={{ color: t.textSub }}>
            {filtered.length} data · Hal {page + 1} / {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30"
              style={{ background: t.iconBg, color: t.textPrimary }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
              return (
                <button key={pg} onClick={() => setPage(pg)} className="w-7 h-7 rounded-lg text-xs font-bold"
                  style={{ background: pg === page ? color : t.iconBg, color: pg === page ? '#fff' : t.textPrimary }}>
                  {pg + 1}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
              className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30"
              style={{ background: t.iconBg, color: t.textPrimary }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 2. TREN BULANAN CHART
// ═══════════════════════════════════════════════════════════════════════════════
export const TrendBulananChart = ({ data, color, label }) => {
  const t        = getTokens();
  const allTahun = [...new Set(data.map(d => d.tahun))].sort((a, b) => b - a);
  const [selectedTahun, setSelectedTahun] = useState(String(allTahun[0] ?? ''));
  const [metric,        setMetric]        = useState('total');

  const chartData = useMemo(() => {
    const yr = parseInt(selectedTahun);
    return BULAN_LABEL.map((bl, idx) => {
      const found = data.find(d => d.tahun === yr && d.bulan === idx + 1);
      return { name: bl, value: found?.[metric] ?? null };
    });
  }, [data, selectedTahun, metric]);

  const CustomDot       = makeHollowDot(color, '#ffffff');
  const CustomActiveDot = makeHollowActiveDot(color, '#ffffff');

  // cardBg tidak tersedia di luar render — buat inline dot yang baca t
  const DotRenderer = (props) => {
    const { cx, cy, value } = props;
    if (value == null || cx == null || cy == null) return null;
    return <circle cx={cx} cy={cy} r={4} stroke={color} strokeWidth={2} fill={t.cardBg} />;
  };
  const ActiveDotRenderer = (props) => {
    const { cx, cy } = props;
    if (cx == null || cy == null) return null;
    return <circle cx={cx} cy={cy} r={6} stroke={color} strokeWidth={2} fill={t.cardBg} />;
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <SectionHead icon={Activity} title={`Tren Bulanan – ${label}`} subtitle="Grafik per tahun" color={color} />
        <div className="flex flex-wrap gap-2">
          <Dropdown value={selectedTahun} onChange={setSelectedTahun}
            options={allTahun.map(y => ({ value: String(y), label: String(y) }))} label="Tahun:" />
          <Dropdown value={metric} onChange={setMetric}
            options={[{ value: 'total', label: 'Total MWh' }, { value: 'rerata', label: 'Rerata Harian' }]}
            label="Metrik:" />
        </div>
      </div>
      <p style={{ fontSize: 11, color: t.textSub, marginBottom: 10 }}>
        Tren pemakaian energi per bulan dalam satu tahun.
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={t.divider} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: t.textSub }} axisLine={{ stroke: t.divider }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: t.textSub }} tickFormatter={fmtYAxis} width={52} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE}
            formatter={(v) => [v != null ? fmtMWh(v) : '—', metric === 'total' ? 'Total MWh' : 'Rerata Harian']}
          />
          <Line
            type="linear" dataKey="value" name={label} stroke={color} strokeWidth={2}
            dot={DotRenderer} activeDot={ActiveDotRenderer} connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 3. GRAFIK GABUNGAN
// ═══════════════════════════════════════════════════════════════════════════════
export const GrafikGabungan = ({ data, color }) => {
  const t        = getTokens();
  const allTahun = useMemo(() => [...new Set(data.map(d => d.tahun))].sort(), [data]);
  const lookup   = useMemo(() => buildLookup(data), [data]);
  const kum      = useMemo(() => buildKum(allTahun, lookup), [allTahun, lookup]);

  const [mode,          setMode]          = useState('yty');
  const [selectedTahun, setSelectedTahun] = useState(String(allTahun[allTahun.length - 1] ?? ''));

  const modeOpts = [
    { value: 'yty',       label: 'Year to Year'          },
    { value: 'mtm',       label: 'Month to Month'         },
    { value: 'kumulatif', label: 'Year of Year Kumulatif' },
  ];
  const tahunOpts        = allTahun.map(yr => ({ value: String(yr), label: String(yr) }));
  const modeLabel        = modeOpts.find(o => o.value === mode)?.label ?? '';
  const needsTahunPicker = mode === 'mtm';

  const ytyData = useMemo(() => BULAN_LABEL.map((bl, idx) => {
    const entry = { name: bl };
    allTahun.forEach(yr => {
      const val = lookup[yr]?.[idx + 1]?.total;
      entry[String(yr)] = val ?? null;
    });
    return entry;
  }), [allTahun, lookup]);

  const mtmData = useMemo(() => {
    const yr = parseInt(selectedTahun);
    return BULAN_LABEL.map((bl, idx) => {
      const b     = idx + 1;
      const curr  = lookup[yr]?.[b]?.total ?? null;
      const prev  = b > 1 ? (lookup[yr]?.[b - 1]?.total ?? null) : null;
      const delta = curr && prev ? pct(curr, prev) : null;
      return { name: bl, total: curr, pctChange: delta };
    });
  }, [selectedTahun, lookup]);

  const kumData = useMemo(() => BULAN_LABEL.map((bl, idx) => {
    const b     = idx + 1;
    const entry = { name: `s/d ${bl}` };
    allTahun.forEach(yr => { entry[String(yr)] = kum[yr]?.[b] || 0; });
    return entry;
  }), [allTahun, kum]);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <SectionHead icon={Activity} title="Grafik Analisis" subtitle={modeLabel} color={color} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {needsTahunPicker && (
            <Dropdown value={selectedTahun} onChange={setSelectedTahun} options={tahunOpts} label="Tahun:" />
          )}
          <Dropdown value={mode} onChange={setMode} options={modeOpts} label="Mode:" />
        </div>
      </div>

      {/* ── YtY Line — hollow dot, warna = YEAR_PALETTE ── */}
      {mode === 'yty' && (
        <>
          <p style={{ fontSize: 11, color: t.textSub, marginBottom: 10 }}>
            Setiap garis = satu tahun. Bandingkan posisi antar tahun pada bulan yang sama.
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={ytyData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.divider} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: t.textSub }} axisLine={{ stroke: t.divider }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: t.textSub }} tickFormatter={fmtYAxis} width={52} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE}
                formatter={(v, name) => [v != null ? fmtMWh(v) : '—', name]}
              />
              <Legend content={renderLegend(t)} wrapperStyle={{ paddingTop: 8 }} />
              {allTahun.map((yr, i) => {
                const clr = YEAR_PALETTE[i % YEAR_PALETTE.length];
                const DotR = (props) => {
                  const { cx, cy, value } = props;
                  if (value == null || cx == null || cy == null) return null;
                  return <circle cx={cx} cy={cy} r={4} stroke={clr} strokeWidth={2} fill={t.cardBg} />;
                };
                const ActiveDotR = (props) => {
                  const { cx, cy } = props;
                  if (cx == null || cy == null) return null;
                  return <circle cx={cx} cy={cy} r={6} stroke={clr} strokeWidth={2} fill={t.cardBg} />;
                };
                return (
                  <Line
                    key={yr}
                    type="linear"
                    dataKey={String(yr)}
                    name={String(yr)}
                    stroke={clr}
                    strokeWidth={2}
                    dot={DotR}
                    activeDot={ActiveDotR}
                    connectNulls={false}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </>
      )}

      {/* ── MtM Line + Bar ── */}
      {mode === 'mtm' && (
        <>
          <p style={{ fontSize: 11, color: t.textSub, marginBottom: 10 }}>
            Garis = total MWh. Bar = % perubahan vs bulan sebelumnya.
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={mtmData} margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.divider} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: t.textSub }} axisLine={{ stroke: t.divider }} tickLine={false} />
              <YAxis yAxisId="left"  tick={{ fontSize: 10, fill: t.textSub }} tickFormatter={fmtYAxis} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: t.textSub }} tickFormatter={v => `${v?.toFixed(0)}%`} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE}
                formatter={(v, name) => {
                  if (name === 'total')     return [v != null ? fmtMWh(v) : '—', 'Total MWh'];
                  if (name === 'pctChange') return [v != null ? `${v >= 0 ? '+' : ''}${v.toFixed(1)}%` : '—', '% vs bln lalu'];
                  return [v, name];
                }}
              />
              <Bar yAxisId="right" dataKey="pctChange" fill={color + '40'} radius={[3,3,0,0]} name="pctChange" />
              <Line
                yAxisId="left" type="linear" dataKey="total" stroke={color} strokeWidth={2} name="total" connectNulls={false}
                dot={(props) => {
                  const { cx, cy, value } = props;
                  if (value == null || cx == null || cy == null) return null;
                  return <circle cx={cx} cy={cy} r={4} stroke={color} strokeWidth={2} fill={t.cardBg} />;
                }}
                activeDot={(props) => {
                  const { cx, cy } = props;
                  if (cx == null || cy == null) return null;
                  return <circle cx={cx} cy={cy} r={6} stroke={color} strokeWidth={2} fill={t.cardBg} />;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}

      {/* ── Kumulatif Bar ── */}
      {mode === 'kumulatif' && (
        <>
          <p style={{ fontSize: 11, color: t.textSub, marginBottom: 10 }}>
            Setiap kelompok bar = total kumulatif Jan s/d bulan tersebut, dibandingkan antar tahun.
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={kumData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke={t.divider} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: t.textSub }} axisLine={{ stroke: t.divider }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: t.textSub }} tickFormatter={fmtYAxis} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE}
                formatter={(v, name) => [fmtMWh(v), name]}
              />
              <Legend content={renderLegend(t)} wrapperStyle={{ paddingTop: 8 }} />
              {allTahun.map((yr, i) => (
                <Bar key={yr} dataKey={String(yr)} fill={YEAR_PALETTE[i % YEAR_PALETTE.length]} radius={[3,3,0,0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 4. MONTH TO MONTH (MtM) TABLE
// ═══════════════════════════════════════════════════════════════════════════════
export const MtMSection = ({ data, color }) => {
  const t        = getTokens();
  const allTahun = useMemo(() => [...new Set(data.map(d => d.tahun))].sort(), [data]);
  const lookup   = useMemo(() => buildLookup(data), [data]);

  const bulanOpts = [
    { value: '0', label: 'Semua Bulan' },
    ...BULAN_LABEL.map((bl, i) => ({ value: String(i + 1), label: bl })),
  ];
  const [filterBulan, setFilterBulan] = useState('0');
  const filterNum    = parseInt(filterBulan);
  const visibleBulan = filterNum > 0 ? [filterNum] : Array.from({ length: 12 }, (_, i) => i + 1);

  const ringkasan = useMemo(() => {
    if (filterNum === 0) return [];
    const prevB = filterNum - 1;
    return allTahun.map(yr => {
      const curr  = lookup[yr]?.[filterNum];
      const prev  = prevB > 0 ? lookup[yr]?.[prevB] : null;
      const delta = curr && prev ? pct(curr.total, prev.total) : null;
      return { tahun: yr, curr, prev, prevB, delta };
    });
  }, [filterNum, allTahun, lookup]);

  const th = thBase(t);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <SectionHead icon={ArrowLeftRight}
          title="Month to Month (MtM)"
          subtitle="Nilai MWh bulan ini dibandingkan dengan bulan sebelumnya (dalam tahun yang sama)"
          color={color} />
        <Dropdown value={filterBulan} onChange={v => setFilterBulan(v)} options={bulanOpts} label="Filter Bulan:" />
      </div>
      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto', minWidth: filterNum > 0 ? 320 : 800 }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: 'left', minWidth: 70, position: 'sticky', left: 0, zIndex: 2 }}>Bulan</th>
              {allTahun.map(yr => (
                <th key={yr} style={{ ...th, minWidth: filterNum > 0 ? 160 : 130, color }}>{yr}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleBulan.map((b, rowIdx) => {
              const bgRow = rowIdx % 2 === 0 ? t.rowOdd : t.rowEven;
              const isHL  = filterNum === b;
              const prevB = b - 1;
              return (
                <tr key={b} style={{ background: isHL ? color + '0A' : bgRow, borderBottom: `1px solid ${t.divider}`, borderLeft: isHL ? `3px solid ${color}` : '3px solid transparent' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, fontSize: 12, color: isHL ? color : t.textPrimary, position: 'sticky', left: 0, background: isHL ? color + '0A' : bgRow, zIndex: 1 }}>
                    {BULAN_FULL[b - 1]}
                  </td>
                  {allTahun.map(yr => {
                    const curr  = lookup[yr]?.[b];
                    const prev  = prevB > 0 ? lookup[yr]?.[prevB] : null;
                    const delta = curr && prev ? pct(curr.total, prev.total) : null;
                    return (
                      <td key={yr} style={{ padding: '10px 12px', textAlign: 'right', verticalAlign: 'top' }}>
                        {curr ? (
                          <>
                            <div style={{ fontWeight: 700, fontSize: 12, color: t.textPrimary, fontVariantNumeric: 'tabular-nums' }}>
                              {fmt(curr.total)}<span style={{ fontSize: 10, color: t.textSub, marginLeft: 2 }}>MWh</span>
                            </div>
                            <div style={{ marginTop: 3 }}>
                              {prev
                                ? <><PctBadge val={delta} t={t} /><span style={{ fontSize: 9, color: t.textSub, marginLeft: 4 }}>vs {BULAN_LABEL[prevB - 1]}</span></>
                                : <span style={{ fontSize: 10, color: t.textSub }}>—</span>}
                            </div>
                          </>
                        ) : <span style={{ color: t.divider, fontSize: 12 }}>—</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          {filterNum === 0 && (
            <tfoot>
              <tr style={{ background: t.rowEven, borderTop: `2px solid ${t.divider}` }}>
                <td style={{ padding: '9px 12px', fontWeight: 700, color: t.textPrimary, fontSize: 11, position: 'sticky', left: 0, background: t.rowEven, zIndex: 1 }}>Rata-rata</td>
                {allTahun.map(yr => {
                  const vals = Array.from({ length: 12 }, (_, i) => lookup[yr]?.[i + 1]?.total || 0).filter(v => v > 0);
                  const avg  = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
                  return (
                    <td key={yr} style={{ padding: '9px 12px', textAlign: 'right', fontSize: 11 }}>
                      <span style={{ fontWeight: 700, color: t.textPrimary }}>{fmt(avg)}</span>
                      <span style={{ fontSize: 10, color: t.textSub, marginLeft: 2 }}>MWh</span>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {filterNum > 0 && ringkasan.length > 0 && (
        <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${t.divider}` }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Ringkasan MtM — {BULAN_FULL[filterNum - 1]} vs {filterNum > 1 ? BULAN_FULL[filterNum - 2] : '(tidak ada bulan sebelumnya)'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {ringkasan.map(({ tahun, curr, prev, prevB, delta }) => (
              <StatCard key={tahun} label={String(tahun)}
                value={curr ? `${fmt(curr.total)} MWh` : '—'}
                sub={prev && prevB > 0 ? `vs ${BULAN_FULL[prevB - 1]}: ${fmt(prev.total)} MWh` : undefined}
                delta={curr && prev ? delta : undefined} t={t} color={color} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 5. YEAR TO YEAR (YtY) TABLE
// ═══════════════════════════════════════════════════════════════════════════════
export const YtYSection = ({ data, color }) => {
  const t        = getTokens();
  const allTahun = useMemo(() => [...new Set(data.map(d => d.tahun))].sort(), [data]);
  const lookup   = useMemo(() => buildLookup(data), [data]);

  const bulanOpts = [
    { value: '0', label: 'Semua Bulan' },
    ...BULAN_LABEL.map((bl, i) => ({ value: String(i + 1), label: bl })),
  ];
  const [filterBulan, setFilterBulan] = useState('0');
  const filterNum    = parseInt(filterBulan);
  const visibleBulan = filterNum > 0 ? [filterNum] : Array.from({ length: 12 }, (_, i) => i + 1);

  const ringkasan = useMemo(() => {
    if (filterNum === 0) return [];
    return allTahun.map((yr, idx) => {
      const curr   = lookup[yr]?.[filterNum];
      const prevYr = allTahun[idx - 1];
      const prev   = prevYr ? lookup[prevYr]?.[filterNum] : null;
      const delta  = curr && prev ? pct(curr.total, prev.total) : null;
      return { tahun: yr, curr, prev, prevYr, delta };
    });
  }, [filterNum, allTahun, lookup]);

  const th = thBase(t);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <SectionHead icon={TrendingUp}
          title="Year to Year (YtY)"
          subtitle="Nilai MWh bulan ini dibandingkan dengan bulan yang sama pada tahun sebelumnya"
          color={color} />
        <Dropdown value={filterBulan} onChange={v => setFilterBulan(v)} options={bulanOpts} label="Filter Bulan:" />
      </div>
      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto', minWidth: filterNum > 0 ? 320 : 900 }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: 'left', minWidth: 72, position: 'sticky', left: 0, zIndex: 2 }}>Tahun</th>
              {visibleBulan.map(b => (
                <th key={b} style={{ ...th, minWidth: filterNum > 0 ? 180 : 110, color: filterNum === b ? color : t.textSub, borderBottom: filterNum === b ? `2px solid ${color}` : '2px solid transparent' }}>
                  {BULAN_LABEL[b - 1]}
                </th>
              ))}
              {filterNum === 0 && <th style={{ ...th, minWidth: 120, color }}>Total Tahun</th>}
            </tr>
          </thead>
          <tbody>
            {allTahun.map((yr, rowIdx) => {
              const prevYr        = rowIdx > 0 ? allTahun[rowIdx - 1] : null;
              const bgRow         = rowIdx % 2 === 0 ? t.rowOdd : t.rowEven;
              const yearTotal     = visibleBulan.reduce((s, b) => s + (lookup[yr]?.[b]?.total || 0), 0);
              const prevYearTotal = prevYr ? visibleBulan.reduce((s, b) => s + (lookup[prevYr]?.[b]?.total || 0), 0) : null;
              const yearDelta     = prevYearTotal ? pct(yearTotal, prevYearTotal) : null;
              return (
                <tr key={yr} style={{ background: bgRow, borderBottom: `1px solid ${t.divider}` }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, fontSize: 13, color, position: 'sticky', left: 0, background: bgRow, zIndex: 1, minWidth: 72 }}>{yr}</td>
                  {visibleBulan.map(b => {
                    const curr  = lookup[yr]?.[b];
                    const prev  = prevYr ? lookup[prevYr]?.[b] : null;
                    const delta = curr && prev ? pct(curr.total, prev.total) : null;
                    const isHL  = filterNum === b;
                    return (
                      <td key={b} style={{ padding: '10px 12px', textAlign: 'right', verticalAlign: 'top', background: isHL ? color + '08' : 'inherit', borderLeft: isHL ? `2px solid ${color}22` : undefined }}>
                        {curr ? (
                          <>
                            <div style={{ fontWeight: 700, fontSize: 12, color: t.textPrimary, fontVariantNumeric: 'tabular-nums' }}>
                              {fmt(curr.total)}<span style={{ fontSize: 10, color: t.textSub, marginLeft: 2 }}>MWh</span>
                            </div>
                            <div style={{ marginTop: 3 }}>
                              <PctBadge val={delta} t={t} />
                              {prev && <span style={{ fontSize: 9, color: t.textSub, marginLeft: 4 }}>vs {prevYr}</span>}
                            </div>
                          </>
                        ) : <span style={{ color: t.divider, fontSize: 12 }}>—</span>}
                      </td>
                    );
                  })}
                  {filterNum === 0 && (
                    <td style={{ padding: '10px 12px', textAlign: 'right', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color, fontVariantNumeric: 'tabular-nums' }}>
                        {fmt(yearTotal)}<span style={{ fontSize: 10, color: t.textSub, fontWeight: 400, marginLeft: 2 }}>MWh</span>
                      </div>
                      <div style={{ marginTop: 3 }}>
                        <PctBadge val={yearDelta} t={t} />
                        {prevYr && <span style={{ fontSize: 9, color: t.textSub, marginLeft: 4 }}>vs {prevYr}</span>}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
          {filterNum === 0 && (
            <tfoot>
              <tr style={{ background: t.rowEven, borderTop: `2px solid ${t.divider}` }}>
                <td style={{ padding: '9px 12px', fontWeight: 700, color: t.textPrimary, fontSize: 11, position: 'sticky', left: 0, background: t.rowEven, zIndex: 1 }}>Rata-rata</td>
                {visibleBulan.map(b => {
                  const vals = allTahun.map(yr => lookup[yr]?.[b]?.total || 0).filter(v => v > 0);
                  const avg  = vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
                  return (
                    <td key={b} style={{ padding: '9px 12px', textAlign: 'right', fontSize: 11 }}>
                      <span style={{ fontWeight: 700, color: t.textPrimary }}>{fmt(avg)}</span>
                      <span style={{ fontSize: 10, color: t.textSub, marginLeft: 2 }}>MWh</span>
                    </td>
                  );
                })}
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {filterNum > 0 && ringkasan.length > 0 && (
        <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${t.divider}` }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Ringkasan YtY — {BULAN_FULL[filterNum - 1]} antar tahun
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {ringkasan.map(({ tahun, curr, prev, prevYr, delta }) => (
              <StatCard key={tahun} label={String(tahun)}
                value={curr ? `${fmt(curr.total)} MWh` : '—'}
                sub={prev ? `vs ${prevYr}: ${fmt(prev.total)} MWh` : undefined}
                delta={curr && prev ? delta : undefined} t={t} color={color} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// 6. YEAR OF YEAR KUMULATIF TABLE
// ═══════════════════════════════════════════════════════════════════════════════
export const YoYKumulatifSection = ({ data, color }) => {
  const t        = getTokens();
  const allTahun = useMemo(() => [...new Set(data.map(d => d.tahun))].sort(), [data]);
  const lookup   = useMemo(() => buildLookup(data), [data]);
  const kum      = useMemo(() => buildKum(allTahun, lookup), [allTahun, lookup]);

  const bulanOpts = [
    { value: '0', label: 'Semua Bulan' },
    ...BULAN_LABEL.map((bl, i) => ({ value: String(i + 1), label: `s/d ${bl}` })),
  ];
  const [filterBulan, setFilterBulan] = useState('0');
  const filterNum    = parseInt(filterBulan);
  const visibleBulan = filterNum > 0 ? [filterNum] : Array.from({ length: 12 }, (_, i) => i + 1);

  const ringkasan = useMemo(() => {
    if (filterNum === 0) return [];
    return allTahun.map((yr, idx) => {
      const currVal = kum[yr]?.[filterNum];
      const prevYr  = allTahun[idx - 1];
      const prevVal = prevYr ? kum[prevYr]?.[filterNum] : null;
      const delta   = currVal && prevVal ? pct(currVal, prevVal) : null;
      return { tahun: yr, currVal, prevVal, prevYr, delta };
    });
  }, [filterNum, allTahun, kum]);

  const th = thBase(t);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <SectionHead icon={BarChart3}
          title="Year of Year — Kumulatif"
          subtitle="Total kumulatif Jan s/d bulan X tahun ini vs kumulatif yang sama tahun lalu"
          color={color} />
        <Dropdown value={filterBulan} onChange={v => setFilterBulan(v)} options={bulanOpts} label="Filter s/d Bulan:" />
      </div>
      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto', minWidth: filterNum > 0 ? 320 : 900 }}>
          <thead>
            <tr>
              <th style={{ ...th, textAlign: 'left', minWidth: 72, position: 'sticky', left: 0, zIndex: 2 }}>Tahun</th>
              {visibleBulan.map(b => (
                <th key={b} style={{ ...th, minWidth: filterNum > 0 ? 200 : 110, color: filterNum === b ? color : t.textSub, borderBottom: filterNum === b ? `2px solid ${color}` : '2px solid transparent' }}>
                  {`s/d ${BULAN_LABEL[b - 1]}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allTahun.map((yr, rowIdx) => {
              const prevYr = rowIdx > 0 ? allTahun[rowIdx - 1] : null;
              const bgRow  = rowIdx % 2 === 0 ? t.rowOdd : t.rowEven;
              return (
                <tr key={yr} style={{ background: bgRow, borderBottom: `1px solid ${t.divider}` }}>
                  <td style={{ padding: '10px 12px', fontWeight: 700, fontSize: 13, color, position: 'sticky', left: 0, background: bgRow, zIndex: 1, minWidth: 72 }}>{yr}</td>
                  {visibleBulan.map(b => {
                    const currVal = kum[yr]?.[b];
                    const prevVal = prevYr ? kum[prevYr]?.[b] : null;
                    const delta   = currVal && prevVal ? pct(currVal, prevVal) : null;
                    const isHL    = filterNum === b;
                    return (
                      <td key={b} style={{ padding: '10px 12px', textAlign: 'right', verticalAlign: 'top', background: isHL ? color + '08' : 'inherit', borderLeft: isHL ? `2px solid ${color}22` : undefined }}>
                        {currVal != null && currVal > 0 ? (
                          <>
                            <div style={{ fontWeight: 700, fontSize: 12, color: t.textPrimary, fontVariantNumeric: 'tabular-nums' }}>
                              {fmt(currVal)}<span style={{ fontSize: 10, color: t.textSub, marginLeft: 2 }}>MWh</span>
                            </div>
                            <div style={{ marginTop: 3 }}>
                              <PctBadge val={delta} t={t} />
                              {prevVal && <span style={{ fontSize: 9, color: t.textSub, marginLeft: 4 }}>vs {prevYr}</span>}
                            </div>
                          </>
                        ) : <span style={{ color: t.divider, fontSize: 12 }}>—</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {filterNum > 0 && ringkasan.length > 0 && (
        <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${t.divider}` }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: t.textSub, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Ringkasan Kumulatif s/d {BULAN_FULL[filterNum - 1]} — antar tahun
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {ringkasan.map(({ tahun, currVal, prevVal, prevYr, delta }) => (
              <StatCard key={tahun} label={String(tahun)}
                value={currVal ? `${fmt(currVal)} MWh` : '—'}
                sub={prevVal ? `vs ${prevYr}: ${fmt(prevVal)} MWh` : undefined}
                delta={currVal && prevVal ? delta : undefined} t={t} color={color} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};