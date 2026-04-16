import React from 'react';
import { Waves } from 'lucide-react';
import { getTokens } from '../shared/ThemeTokens';
import {
  PageHeader, TabelBulanan, TrendBulananChart,
  GrafikGabungan, MtMSection, YtYSection, YoYKumulatifSection,
} from './KTTBase';

// ─── Constants ────────────────────────────────────────────────────────────────
const COLOR    = '#009FAF';
const LABEL    = 'WINA';
const SUBTITLE = 'PT Wilmar Nabati Indonesia';

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export const WINAMonitoring = ({ data = [] }) => {
  const t = getTokens();

  if (!data.length) {
    return (
      <div className="space-y-6">
        <PageHeader icon={Waves} title={LABEL} subtitle={SUBTITLE} color={COLOR} />
        <div className="rounded-2xl p-5" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
          <div className="text-center py-16">
            <Waves className="w-12 h-12 mx-auto mb-4" style={{ color: t.textSub }} />
            <p className="text-base font-semibold" style={{ color: t.textPrimary }}>Data WINA Belum Tersedia</p>
            <p className="text-xs mt-1" style={{ color: t.textSub }}>Pastikan spreadsheet sudah diset public.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={Waves} title={LABEL} subtitle={SUBTITLE} color={COLOR} />

      {/* Tabel data bulanan + harian */}
      <TabelBulanan data={data} color={COLOR} label={LABEL} />

      {/* Tren bulanan per tahun */}
      <TrendBulananChart data={data} color={COLOR} label={LABEL} />

      {/* Grafik gabungan interaktif — YtY / MtM / Kumulatif */}
      <GrafikGabungan data={data} color={COLOR} />

      {/* Tabel Month to Month */}
      <MtMSection data={data} color={COLOR} />

      {/* Tabel Year to Year */}
      <YtYSection data={data} color={COLOR} />

      {/* Tabel Year of Year Kumulatif */}
      <YoYKumulatifSection data={data} color={COLOR} />
    </div>
  );
};

export default WINAMonitoring;