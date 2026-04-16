import React from 'react';
import { Layers } from 'lucide-react';
import { getTokens } from '../shared/ThemeTokens';
import {
  PageHeader, TabelBulanan, TrendBulananChart,
  GrafikGabungan, MtMSection, YtYSection, YoYKumulatifSection,
} from './KTTBase';

const COLOR    = '#9B59B6';
const LABEL    = 'Total UIDRKR';
const SUBTITLE = 'Gabungan semua KTT';

export const TOTALMonitoring = ({ data = [] }) => {
  const t = getTokens();

  if (!data.length) {
    return (
      <div className="space-y-6">
        <PageHeader icon={Layers} title={LABEL} subtitle={SUBTITLE} color={COLOR} />
        <div className="rounded-2xl p-5" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
          <div className="text-center py-16">
            <Layers className="w-12 h-12 mx-auto mb-4" style={{ color: t.textSub }} />
            <p className="text-base font-semibold" style={{ color: t.textPrimary }}>Data Total UIDRKR Belum Tersedia</p>
            <p className="text-xs mt-1" style={{ color: t.textSub }}>Pastikan spreadsheet sudah diset public.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader icon={Layers} title={LABEL} subtitle={SUBTITLE} color={COLOR} />
      <TabelBulanan        data={data} color={COLOR} label={LABEL} />
      <TrendBulananChart   data={data} color={COLOR} label={LABEL} />
      <GrafikGabungan      data={data} color={COLOR} />
      <MtMSection          data={data} color={COLOR} />
      <YtYSection          data={data} color={COLOR} />
      <YoYKumulatifSection data={data} color={COLOR} />
    </div>
  );
};

export default TOTALMonitoring;