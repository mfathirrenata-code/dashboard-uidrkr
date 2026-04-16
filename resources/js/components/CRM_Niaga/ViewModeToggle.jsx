import React from 'react';
import { BarChart3, Table } from 'lucide-react';

export const ViewModeToggle = ({ viewMode, onViewModeChange }) => {
  // Mengelompokkan utility class yang dipakai berulang agar JSX tetap bersih
  const btnBaseClass = "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-200 border-none cursor-pointer";
  
  const activeClass = "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-500/20";
  const inactiveClass = "bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-200/50";

  return (
    <div className="flex bg-slate-50 border-2 border-slate-100 rounded-[10px] p-1 w-fit">
      <button
        onClick={() => onViewModeChange('table')}
        className={`${btnBaseClass} ${viewMode === 'table' ? activeClass : inactiveClass}`}
      >
        <Table className="w-4 h-4" />
        Tabel
      </button>
      
      <button
        onClick={() => onViewModeChange('chart')}
        className={`${btnBaseClass} ${viewMode === 'chart' ? activeClass : inactiveClass}`}
      >
        <BarChart3 className="w-4 h-4" />
        Grafik
      </button>
    </div>
  );
};