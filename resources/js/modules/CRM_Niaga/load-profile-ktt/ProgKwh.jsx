import React from 'react';
import { getTokens } from '../shared/ThemeTokens';

const BULAN_LABELS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

function fmt(v) {
  if (v == null || v === 0) return '—';
  return Number(v).toLocaleString('id-ID', { maximumFractionDigits: 2 });
}

function pct(real, prog) {
  if (!prog) return null;
  return ((real / prog) * 100).toFixed(1);
}

function StatusBadge({ real, prog }) {
  const p = pct(real, prog);
  if (p == null) return null;
  const num = parseFloat(p);
  const ok  = num >= 100;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
      background: ok ? '#27AE6014' : '#E74C3C14',
      color:      ok ? '#27AE60'   : '#E74C3C',
      border:     ok ? '1px solid #27AE6030' : '1px solid #E74C3C30',
    }}>
      {p}%
    </span>
  );
}

function ProgTable({ data, title, color }) {
  const t = getTokens();

  const totalProg = data.reduce((s, r) => s + (r.prog || 0), 0);
  const totalReal = data.reduce((s, r) => s + (r.real || 0), 0);
  const totalLoss = data.reduce((s, r) => s + (r.loss || 0), 0);

  return (
    <div style={{
      background:   t.cardBg,
      border:       `1px solid ${t.cardBorder}`,
      borderRadius: 14,
      overflow:     'hidden',
      flex:         '1 1 0',
      minWidth:     0,
    }}>
      {/* Header */}
      <div style={{
        padding:      '12px 16px',
        borderBottom: `1px solid ${t.cardBorder}`,
        display:      'flex',
        alignItems:   'center',
        gap:          8,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: color, flexShrink: 0,
        }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: t.textPrimary, flex: 1 }}>
          {title}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700,
          padding: '2px 8px', borderRadius: 99,
          background: color,
          color: '#fff',
        }}>
          {data.length} bln
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${t.cardBorder}` }}>
              {['Bulan', 'Prog', 'Realisasi', 'Losses', '%'].map((h, i) => (
                <th key={h} style={{
                  padding:       '8px 12px',
                  textAlign:     i === 0 ? 'left' : 'right',
                  fontSize:      10,
                  fontWeight:    700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color:         t.textSub,
                  whiteSpace:    'nowrap',
                  background:    t.rowEven,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const bulanLabel = BULAN_LABELS[(row.bulan || 1) - 1] || row.bulanStr || '—';
              const bgRow      = idx % 2 === 0 ? t.rowOdd : t.rowEven;
              return (
                <tr key={idx} style={{ background: bgRow, borderBottom: `1px solid ${t.divider}` }}>
                  <td style={{ padding: '8px 12px', color: t.textPrimary, fontWeight: 600 }}>
                    {bulanLabel}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: t.textSub }}>
                    {fmt(row.prog)}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: t.textPrimary, fontWeight: 600 }}>
                    {fmt(row.real)}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: '#D85A30' }}>
                    {fmt(row.loss)}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                    <StatusBadge real={row.real} prog={row.prog} />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: `2px solid ${t.divider}`, background: color + '12' }}>
              <td style={{ padding: '9px 12px', fontWeight: 700, color: t.textPrimary, fontSize: 11 }}>
                TOTAL
              </td>
              <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600, color: t.textSub }}>
                {fmt(totalProg)}
              </td>
              <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 700, color }}>
                {fmt(totalReal)}
              </td>
              <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600, color: '#D85A30' }}>
                {fmt(totalLoss)}
              </td>
              <td style={{ padding: '9px 12px', textAlign: 'right' }}>
                <StatusBadge real={totalReal} prog={totalProg} />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export function ProgKwh({ kttData }) {
  const t = getTokens();

  const progWina = kttData?.progWina || [];
  const progPhr  = kttData?.progPhr  || [];
  const isEmpty  = progWina.length === 0 && progPhr.length === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: t.textPrimary, margin: 0, lineHeight: 1.2 }}>
          Progresif Pemakaian kWh
        </h2>
        <p style={{ fontSize: 12, color: t.textSub, marginTop: 4 }}>
          Realisasi vs program pemakaian kWh KTT — PROG WINA &amp; PROG PHR
        </p>
      </div>

      {isEmpty ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          color:        t.textSub,
          background:   t.cardBg,
          border:       `1px solid ${t.cardBorder}`,
          borderRadius: 14,
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: t.textPrimary }}>Data belum tersedia</p>
          <p style={{ fontSize: 12 }}>Sheet PROG WINA dan PROG PHR belum berhasil dimuat</p>
        </div>
      ) : (
        /* ── Side by side ── */
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {progWina.length > 0 && (
            <ProgTable data={progWina} title="PROG WINA — PT Wilmar Nabati" color="#52D6C4" />
          )}
          {progPhr.length > 0 && (
            <ProgTable data={progPhr} title="PROG PHR — PT Pertamina Hulu Rokan" color="#7CB9FF" />
          )}
        </div>
      )}
    </div>
  );
}

export default ProgKwh;