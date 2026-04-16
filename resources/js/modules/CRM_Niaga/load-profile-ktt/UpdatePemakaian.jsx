import React, { useMemo, useState } from 'react';
import { Gauge, TrendingDown, TrendingUp } from 'lucide-react';
import { getTokens } from '../shared/ThemeTokens';

const fmt = (n) => {
  try { return new Intl.NumberFormat('id-ID').format(Math.round(n ?? 0)); }
  catch { return '0'; }
};

const BULAN_NAMA = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
];

const KTT_COLORS = { wina: '#009FAF', phr: '#2E7DD4', total: '#9B59B6' };

const getLatest = (data) => {
  if (!Array.isArray(data) || !data.length) return null;
  return data.reduce((a, b) =>
    b.tahun > a.tahun || (b.tahun === a.tahun && b.bulan > a.bulan) ? b : a
  );
};

/** Mengambil entry N bulan sebelum `latest` (offset=0 → latest, offset=1 → 1 bulan lalu, dst.) */
const getOffsetMonth = (data, latest, offset) => {
  if (!latest || !Array.isArray(data)) return null;
  let b = latest.bulan - offset, y = latest.tahun;
  while (b < 1) { b += 12; y -= 1; }
  return data.find(d => d.tahun === y && d.bulan === b) ?? null;
};

const getPrevYear = (data, latest) => {
  if (!latest || !Array.isArray(data)) return null;
  return data.find(d => d.tahun === latest.tahun - 1 && d.bulan === latest.bulan) ?? null;
};

/**
 * Kumulatif s/d bulan tertentu dalam tahun yang sama.
 * Mis. Des 2025 → sum Jan–Des 2025
 *      Jan 2026 → sum Jan–Jan 2026
 *      Feb 2026 → sum Jan–Feb 2026
 */
const getKumulatif = (data, tahun, bulanMax) => {
  if (!Array.isArray(data)) return 0;
  return data
    .filter(d => d.tahun === tahun && d.bulan <= bulanMax)
    .reduce((s, d) => s + (d.total ?? 0), 0);
};

const getRerata3 = (data, latest) => {
  if (!latest || !Array.isArray(data)) return 0;
  const entries = [];
  for (let i = 0; i < 3; i++) {
    let b = latest.bulan - i, y = latest.tahun;
    if (b < 1) { b += 12; y -= 1; }
    const found = data.find(d => d.tahun === y && d.bulan === b);
    if (found) entries.push(found.total ?? 0);
  }
  return entries.length ? entries.reduce((s, v) => s + v, 0) / entries.length : 0;
};

const calcPct = (curr, prev) => {
  if (!prev || prev === 0) return null;
  return ((curr - prev) / prev) * 100;
};

const fmtBulanEntry = (entry) => {
  if (!entry) return '—';
  return `${BULAN_NAMA[entry.bulan - 1]} ${entry.tahun}`;
};

// ── UI Components ─────────────────────────────────────────────────────────────

const SectionHead = ({ title, subtitle }) => {
  const t = getTokens();
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: t.iconBg }}>
        <Gauge className="w-4 h-4" style={{ color: t.accentColor }} />
      </div>
      <div>
        <h2 className="text-sm font-bold leading-none" style={{ color: t.textPrimary }}>{title}</h2>
        {subtitle && <p className="text-[10px] mt-0.5" style={{ color: t.textSub }}>{subtitle}</p>}
      </div>
    </div>
  );
};

const PctBadge = ({ val }) => {
  if (val == null) return <span style={{ color: '#999', fontSize: 11 }}>—</span>;
  const pos = val >= 0;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold"
      style={{ color: pos ? '#27AE60' : '#E05555' }}>
      {pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {pos ? '+' : ''}{val.toFixed(2)}%
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

export const UpdatePemakaian = ({ wina, phr, total }) => {
  const t = getTokens();
  const [sumber, setSumber] = useState('all');

  const winaData  = Array.isArray(wina)  ? wina  : [];
  const phrData   = Array.isArray(phr)   ? phr   : [];
  const totalData = Array.isArray(total) ? total : [];

  const calc = useMemo(() => {
    const result  = {};
    const sources = { wina: winaData, phr: phrData, total: totalData };

    for (const [key, data] of Object.entries(sources)) {
      try {
        const latest  = getLatest(data);
        const prev1   = getOffsetMonth(data, latest, 1); // 1 bulan sebelum latest
        const prev2   = getOffsetMonth(data, latest, 2); // 2 bulan sebelum latest
        const prevY   = getPrevYear(data, latest);
        const rerata3 = getRerata3(data, latest);

        // Kumulatif masing-masing dari 3 bulan terakhir
        const kumPrev2 = prev2
          ? getKumulatif(data, prev2.tahun, prev2.bulan) : 0;
        const kumPrev1 = prev1
          ? getKumulatif(data, prev1.tahun, prev1.bulan) : 0;
        const kumLatest = latest
          ? getKumulatif(data, latest.tahun, latest.bulan) : 0;

        const latestTotal = latest?.total ?? 0;
        const prev1Total  = prev1?.total  ?? 0;
        const prevYTotal  = prevY?.total  ?? 0;

        result[key] = {
          latest,
          prev1,
          prev2,
          prevY,
          rerata3,
          kumPrev2,
          kumPrev1,
          kumLatest,
          yoyBulPct:  calcPct(latestTotal, prevYTotal),
          yoyBulDiff: latestTotal - prevYTotal,
          // YoY Kumulatif: banding kumLatest vs tahun lalu bulan yang sama
          yoyKomPct:  calcPct(kumLatest, latest
            ? getKumulatif(data, latest.tahun - 1, latest.bulan) : 0),
          yoyKomDiff: kumLatest - (latest
            ? getKumulatif(data, latest.tahun - 1, latest.bulan) : 0),
          mtmPct:     calcPct(latestTotal, prev1Total),
          mtmDiff:    latestTotal - prev1Total,
        };
      } catch (e) {
        console.error('UpdatePemakaian calc error:', key, e);
        result[key] = {
          latest: null, prev1: null, prev2: null, prevY: null, rerata3: 0,
          kumPrev2: 0, kumPrev1: 0, kumLatest: 0,
          yoyBulPct: null, yoyBulDiff: 0,
          yoyKomPct: null, yoyKomDiff: 0,
          mtmPct: null,    mtmDiff: 0,
        };
      }
    }
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winaData.length, phrData.length, totalData.length]);

  const refLatest = calc.total?.latest ?? calc.wina?.latest ?? calc.phr?.latest;
  const refPrev1  = calc.total?.prev1  ?? calc.wina?.prev1  ?? calc.phr?.prev1;
  const refPrev2  = calc.total?.prev2  ?? calc.wina?.prev2  ?? calc.phr?.prev2;

  // Label bulan dinamis
  const bulanIni   = fmtBulanEntry(refLatest); // Februari 2026
  const bulanLalu  = fmtBulanEntry(refPrev1);  // Januari 2026
  const bulan2Lalu = fmtBulanEntry(refPrev2);  // Desember 2025

  const sumberOpts = [
    { value: 'all',   label: 'Semua'        },
    { value: 'wina',  label: 'WINA'         },
    { value: 'phr',   label: 'PHR'          },
    { value: 'total', label: 'Total UIDRKR'  },
  ];

  const allCols = [
    { key: 'wina',  label: 'WINA',         color: KTT_COLORS.wina  },
    { key: 'phr',   label: 'PHR',          color: KTT_COLORS.phr   },
    { key: 'total', label: 'Total UIDRKR', color: KTT_COLORS.total },
  ];
  const cols = sumber === 'all' ? allCols : allCols.filter(c => c.key === sumber);

  const rows = [
    // ── Komulatif 3 bulan terakhir ────────────────────────────────────────────
    {
      label:    `PTL ${bulan2Lalu} (Komulatif)`,
      isPct:    false,
      getValue: (k) => calc[k]?.kumPrev2 ?? 0,
    },
    {
      label:    `PTL ${bulanLalu} (Komulatif)`,
      isPct:    false,
      getValue: (k) => calc[k]?.kumPrev1 ?? 0,
    },
    {
      label:    `PTL ${bulanIni} (Komulatif)`,
      isPct:    false,
      getValue: (k) => calc[k]?.kumLatest ?? 0,
    },
    // ── PTL bulanan 3 bulan terakhir ──────────────────────────────────────────
    {
      label:    `PTL ${bulan2Lalu}`,
      isPct:    false,
      getValue: (k) => calc[k]?.prev2?.total ?? 0,
    },
    {
      label:    `PTL ${bulanLalu}`,
      isPct:    false,
      getValue: (k) => calc[k]?.prev1?.total ?? 0,
    },
    {
      label:    `PTL ${bulanIni}`,
      isPct:    false,
      getValue: (k) => calc[k]?.latest?.total ?? 0,
    },
    // ── Rerata & perbandingan ─────────────────────────────────────────────────
    {
      label:    'Rerata 3 Bulan Terakhir',
      isPct:    false,
      getValue: (k) => calc[k]?.rerata3 ?? 0,
    },
    {
      label:   'YoY Kumulatif',
      isPct:   true,
      getPct:  (k) => calc[k]?.yoyKomPct,
      getDiff: (k) => calc[k]?.yoyKomDiff ?? 0,
    },
    {
      label:   `YoY Bulan (${bulanIni})`,
      isPct:   true,
      getPct:  (k) => calc[k]?.yoyBulPct,
      getDiff: (k) => calc[k]?.yoyBulDiff ?? 0,
    },
    {
      label:   `MtM (${bulanIni} vs ${bulanLalu})`,
      isPct:   true,
      getPct:  (k) => calc[k]?.mtmPct,
      getDiff: (k) => calc[k]?.mtmDiff ?? 0,
    },
  ];

  if (!refLatest) {
    return (
      <div className="rounded-2xl p-5"
        style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
        <SectionHead title="Update Pemakaian KTT" subtitle="Monitoring load profile terkini" />
        <div className="text-center py-8" style={{ color: t.textSub }}>
          <Gauge className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Data belum tersedia</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-5"
      style={{
        background:  t.cardBg,
        border:      `1px solid ${t.cardBorder}`,
        boxShadow:   '0 1px 4px rgba(0,0,0,0.06)',
      }}>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <SectionHead
          title="Update Pemakaian KTT"
          subtitle={`Data terkini: ${bulanIni}`}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: t.textSub }}>Tampilkan:</span>
          <select
            value={sumber}
            onChange={e => setSumber(e.target.value)}
            className="text-xs font-semibold rounded-lg px-3 py-1.5 outline-none"
            style={{
              background: t.iconBg,
              border:     `1px solid ${t.btnBorder}`,
              color:      t.textPrimary,
              cursor:     'pointer',
            }}>
            {sumberOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ background: t.rowEven }}>
              <th style={{
                padding: '8px 12px', textAlign: 'left',
                color: t.textSub, fontWeight: 700, width: '34%',
              }}>
                Indikator
              </th>
              {cols.map(c => (
                <th key={c.key}
                  style={{ padding: '8px 12px', textAlign: 'center', color: c.color, fontWeight: 700 }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{
                background:   i % 2 === 0 ? t.rowOdd : t.rowEven,
                borderBottom: `1px solid ${t.divider}`,
              }}>
                <td style={{ padding: '8px 12px', color: t.textPrimary, fontWeight: 600 }}>
                  {row.label}
                </td>
                {cols.map(c => (
                  <td key={c.key} style={{ padding: '8px 12px', textAlign: 'center' }}>
                    {row.isPct ? (
                      <div style={{ lineHeight: 1.8 }}>
                        <PctBadge val={row.getPct(c.key)} />
                        <br />
                        <span style={{ color: t.textSub, fontSize: 10 }}>
                          {(() => {
                            const d = row.getDiff(c.key);
                            return `${d >= 0 ? '+' : ''}${fmt(Math.round(d))} MWh`;
                          })()}
                        </span>
                      </div>
                    ) : (
                      <>
                        <span style={{ color: t.textPrimary, fontWeight: 700 }}>
                          {fmt(Math.round(row.getValue(c.key)))}
                        </span>
                        <span style={{ color: t.textSub, fontSize: 10, marginLeft: 3 }}>MWh</span>
                      </>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UpdatePemakaian;