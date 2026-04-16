import React, { useState, useMemo } from 'react';

export const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
    // Kalau sortConfig null (kondisi OFF), balikin data aslinya
    if (!sortConfig) return items;

    let sortableItems = [...items];
    sortableItems.sort((a, b) => {
      // Antisipasi kalau datanya null/undefined biar nggak error
      let valA = a[sortConfig.key] ?? '';
      let valB = b[sortConfig.key] ?? '';

      // Coba konversi ke Number
      const numA = Number(valA);
      const numB = Number(valB);

      // Cek apakah KEDUANYA adalah angka valid (bukan NaN dan bukan string kosong)
      const isNumA = valA !== '' && !isNaN(numA);
      const isNumB = valB !== '' && !isNaN(numB);

      if (isNumA && isNumB) {
        // Kalau dua-duanya angka, kita bandingkan secara matematis
        valA = numA;
        valB = numB;
      } else {
        // Kalau bukan angka (teks biasa), ubah ke huruf kecil biar case-insensitive
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      // Logika perbandingan
      if (valA < valB) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    
    // Logika 3 arah: Asc -> Desc -> Off (null)
    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null; // Matiin sort
      }
    }
    
    if (direction === null) {
      setSortConfig(null);
    } else {
      setSortConfig({ key, direction });
    }
  };

  return { items: sortedItems, requestSort, sortConfig };
};

// Update Icon biar kalau kondisi OFF, dia nampilin icon default (abu-abu/netral)
export const SortIcon = ({ columnKey, sortConfig }) => {
  if (!sortConfig || sortConfig.key !== columnKey) {
    // Icon default pas lagi nggak di-sort
    return (
      <svg className="w-3.5 h-3.5 ml-1.5 text-slate-300 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    );
  }
  if (sortConfig.direction === 'asc') {
    return (
      <svg className="w-3.5 h-3.5 ml-1.5 text-[#00A2E9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
      </svg>
    );
  }
  return (
    <svg className="w-3.5 h-3.5 ml-1.5 text-[#00A2E9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
    </svg>
  );
};