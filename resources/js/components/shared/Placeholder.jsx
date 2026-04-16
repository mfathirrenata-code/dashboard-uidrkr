import React from 'react';

export default function Placeholder({ activeSubMenu }) {
  return (
    <main className="flex-1 bg-[#F8FAFC] p-8">
      <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl shadow-sm border border-[#E2E8F0]">
        <h3 className="text-xl font-bold text-[#64748B]">
          Modul {activeSubMenu.childLabel || activeSubMenu.parentLabel} Segera Hadir
        </h3>
        <p className="text-sm text-[#94A3B8] mt-2">Sedang dalam tahap pengembangan oleh tim.</p>
      </div>
    </main>
  );
}