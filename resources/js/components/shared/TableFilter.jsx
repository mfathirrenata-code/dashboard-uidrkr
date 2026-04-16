import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// =========================================================================
// SUB-KOMPONEN: Mengurus state masing-masing filter (Auto-apply)
// =========================================================================
const FilterSection = ({ filter, isExpanded, onToggleExpand }) => {
  const { columnName, uniqueValues, selectedFilters, onFilterChange, isDatePicker } = filter;
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const [viewDate, setViewDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const months = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGS", "SEP", "OKT", "NOV", "DES"];
  const days = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];

  const renderCalendar = (offset = 0) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    const m = date.getMonth();
    const y = date.getFullYear();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(new Date(y, m, i));
    return { m, y, calendarDays };
  };

  const handleDateClick = (date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else if (date < startDate) {
      setStartDate(date);
      setEndDate(null);
    } else {
      setEndDate(date);
    }
  };

  const handleApplyDateRange = () => {
    if (startDate && endDate) {
      const validDates = uniqueValues.filter(val => {
        const d = new Date(val); d.setHours(0,0,0,0);
        const s = new Date(startDate); s.setHours(0,0,0,0);
        const e = new Date(endDate); e.setHours(23,59,59,999);
        return d >= s && d <= e;
      });
      onFilterChange(validDates);
    } else if (startDate) {
      const validDates = uniqueValues.filter(val => {
        const d = new Date(val); d.setHours(0,0,0,0);
        const s = new Date(startDate); s.setHours(0,0,0,0);
        return d.getTime() === s.getTime();
      });
      onFilterChange(validDates);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) onFilterChange(uniqueValues);
    else onFilterChange([]);
  };

  const handleToggleFilter = (val) => {
    const newFilters = selectedFilters.includes(val)
      ? selectedFilters.filter(item => item !== val)
      : [...selectedFilters, val];
    onFilterChange(newFilters);
  };

  const handleSelectOnly = (e, val) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    onFilterChange([val]);
  };

  const formattedColumnName = columnName.replace(/_/g, ' ').toUpperCase();

  return (
    <div className="flex flex-col border-b border-[#E2E8F0] last:border-b-0">
      <button
        onClick={onToggleExpand}
        className={`flex items-center justify-between w-full p-3 text-left transition-colors ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50 bg-white'}`}
      >
        <div className="flex items-center gap-2">
          {isDatePicker ? (
            <svg className="w-4 h-4 text-[#00A2E9] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-[#00A2E9] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          )}
          <span className="text-[12px] font-bold text-[#475569]">{formattedColumnName}</span>
        </div>
        <svg className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="bg-white flex flex-col">
          {isDatePicker ? (
            <div className="p-4 flex flex-col gap-4 bg-slate-50 border-t border-[#E2E8F0]">
              <div className="flex gap-4 sm:gap-8 flex-col sm:flex-row">
                {[renderCalendar(0), renderCalendar(1)].map((cal, idx) => (
                  <div key={idx} className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      {idx === 0 && <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-1 hover:bg-slate-200 rounded-full"><svg className="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg></button>}
                      <span className="text-xs font-black text-[#0F172A] mx-auto">{months[cal.m]} {cal.y}</span>
                      {idx === 1 && <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-1 hover:bg-slate-200 rounded-full"><svg className="w-4 h-4 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg></button>}
                    </div>
                    <div className="grid grid-cols-7 gap-y-1 text-center mb-1">
                      {days.map((d, i) => <span key={i} className="text-[9px] font-bold text-[#94A3B8]">{d}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-y-0.5">
                      {cal.calendarDays.map((d, i) => {
                        const isSel = d && ((startDate && d.getTime() === startDate.getTime()) || (endDate && d.getTime() === endDate.getTime()));
                        const isRange = d && startDate && endDate && d > startDate && d < endDate;
                        return (
                          <div key={i} onClick={() => d && handleDateClick(d)} className={`h-7 sm:h-8 flex items-center justify-center text-[11px] font-bold cursor-pointer rounded-lg transition-all ${!d ? '' : 'hover:bg-[#F0F9FF] hover:text-[#00A2E9] bg-white'} ${isSel ? '!bg-[#00A2E9] !text-white shadow-sm' : ''} ${isRange ? '!bg-[#F0F9FF] !text-[#00A2E9] rounded-none' : ''}`}>
                            {d ? d.getDate() : ''}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-3 border-t border-[#CBD5E1]">
                <button onClick={handleApplyDateRange} className="px-5 py-1.5 bg-[#00A2E9] text-white text-[10px] font-black rounded-lg hover:bg-[#008CC9]">Terapkan Tanggal</button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-t border-[#E2E8F0]">
              <div className="p-2.5 border-b border-[#E2E8F0] flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer pl-1">
                  <input type="checkbox" checked={selectedFilters.length === uniqueValues.length && uniqueValues.length > 0} onChange={handleSelectAll} className="w-3.5 h-3.5 rounded text-[#00A2E9] focus:ring-[#00A2E9] cursor-pointer" />
                  <span className="font-bold text-[#0F172A] text-[11px] uppercase tracking-wider">Pilih Semua</span>
                </label>
              </div>
              <div className="p-2 border-b border-[#E2E8F0]">
                <div className="relative">
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" placeholder="Telusuri..." className="w-full pl-8 pr-2 py-1.5 text-xs bg-white border border-[#CBD5E1] focus:border-[#00A2E9] focus:ring-1 focus:ring-[#00A2E9] rounded outline-none transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-slate-200">
                {uniqueValues.filter(val => String(val).toLowerCase().includes(searchTerm.toLowerCase())).map(val => (
                  <label key={val} className="flex items-center justify-between p-2 hover:bg-slate-100 rounded cursor-pointer transition-colors group relative">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <input type="checkbox" checked={selectedFilters.includes(val)} onChange={() => handleToggleFilter(val)} className="w-3.5 h-3.5 rounded border-slate-300 text-[#00A2E9] focus:ring-[#00A2E9] cursor-pointer flex-shrink-0" />
                      <span className="text-xs font-medium text-[#475569] group-hover:text-[#0F172A] truncate">{val}</span>
                    </div>
                    <button onClick={(e) => handleSelectOnly(e, val)} className="opacity-0 group-hover:opacity-100 absolute right-2 text-[10px] font-bold text-[#00A2E9] hover:text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded transition-opacity">Hanya ini</button>
                  </label>
                ))}
                {uniqueValues.filter(val => String(val).toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && <div className="p-3 text-center text-xs text-slate-500">Data tidak ditemukan</div>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =========================================================================
// KOMPONEN UTAMA: TableFilter (Portal Version Fixed)
// =========================================================================
export default function TableFilter({ 
  filters = [], 
  alignRight = false, 
  fullWidth = false,
  compactMode = false,
  buttonText = "Filter Data"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({});
  
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8, 
        left: alignRight ? 'auto' : rect.left,
        right: alignRight ? window.innerWidth - rect.right : 'auto',
      });
    }
  }, [isOpen, alignRight]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen && 
        buttonRef.current && !buttonRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = (event) => {
      // PERBAIKAN: Jika scroll terjadi DI DALAM dropdown, jangan tutup pop-upnya
      if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
        return; 
      }
      
      // Jika scroll terjadi di luar (halaman), baru tutup
      if (isOpen) setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true); 

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  if (!filters || filters.length === 0) return null;

  const btnPadding = compactMode ? 'px-3 py-1' : 'px-3.5 py-1.5';
  const btnTextSize = compactMode ? 'text-[11px]' : 'text-[13px]';
  const iconSize = compactMode ? 'w-3.5 h-3.5' : 'w-4 h-4';

  const activeFilter = filters.find(f => f.columnName === expandedSection);
  const isCalendarOpen = activeFilter?.isDatePicker;

  const DropdownContent = (
    <div 
      ref={dropdownRef}
      style={{
        position: 'fixed', 
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        right: dropdownPosition.right,
        zIndex: 99999, 
      }}
      className={`bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200
        ${isCalendarOpen ? 'w-[320px] sm:w-[580px]' : 'w-[280px] sm:w-72'} transition-all`}
    >
      <div className="p-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
        <h3 className="text-sm font-black text-[#0F172A]">Filter Data</h3>
        <p className="text-[11px] text-[#64748B]">Buka kategori untuk memilih</p>
      </div>

      <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
        {filters.map((filterObj, idx) => (
          <FilterSection 
            key={idx}
            filter={filterObj}
            isExpanded={expandedSection === filterObj.columnName}
            onToggleExpand={() => setExpandedSection(
              expandedSection === filterObj.columnName ? null : filterObj.columnName
            )}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className={`${fullWidth ? 'w-full' : 'inline-block'}`}>
      <button 
        ref={buttonRef} 
        onClick={() => setIsOpen(!isOpen)} 
        className={`relative z-50 flex items-center justify-between gap-1.5 ${btnPadding} border border-[#CBD5E1] rounded-full ${btnTextSize} font-semibold transition-colors shadow-sm ${
          fullWidth ? 'w-full' : ''
        } ${
          isOpen ? 'bg-[#F8FAFC] border-[#00A2E9] text-[#00A2E9]' : 'text-[#475569] hover:bg-slate-50 bg-white'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <svg className={`${iconSize} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>{buttonText}</span>
        </div>
        {/* PERBAIKAN: viewBox dikembalikan ke 0 0 24 24 dan ditambahkan flex-shrink-0 agar tidak terdistorsi */}
        <svg className={`${iconSize} flex-shrink-0 text-[#94A3B8] transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#00A2E9]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        DropdownContent,
        document.body
      )}
    </div>
  );
}