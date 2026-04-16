import React, { useState } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import html2canvas from 'html2canvas';

export const ExportButton = ({
  targetRef,          
  filename = 'dashboard',
  disabled = false,
  tooltip  = 'Upload data terlebih dahulu',
}) => {
  const [exporting, setExporting] = useState(false);
  const [showMenu,  setShowMenu]  = useState(false);

  // LOGIKA EXPORT TIDAK DIUBAH SAMA SEKALI
  const handleExport = async (format) => {
    if (!targetRef?.current || exporting || disabled) return;
    setExporting(true);
    setShowMenu(false);

    try {
      const el = targetRef.current;

      const prevDisplay = el.style.display;
      const prevPos     = el.style.position;
      const prevLeft    = el.style.left;
      const prevTop     = el.style.top;

      if (getComputedStyle(el).display === 'none') {
        el.style.position = 'fixed';
        el.style.left     = '-9999px';
        el.style.top      = '0';
        el.style.display  = 'block';
      }

      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      const canvas = await html2canvas(el, {
        scale: 2,                          
        backgroundColor: null,             
        logging: false,
        useCORS: true,
        allowTaint: true,
        windowWidth:  el.scrollWidth,
        windowHeight: el.scrollHeight,
      });

      el.style.display  = prevDisplay;
      el.style.position = prevPos;
      el.style.left     = prevLeft;
      el.style.top      = prevTop;

      const link = document.createElement('a');
      const mime  = format === 'png' ? 'image/png' : 'image/jpeg';
      link.download = `${filename}.${format}`;
      link.href     = canvas.toDataURL(mime, format === 'jpg' ? 0.92 : 1.0);
      link.click();
    } catch (err) {
      console.error('Export gagal:', err);
      alert('Gagal membuat gambar: ' + (err.message || 'Unknown error'));
    } finally {
      setExporting(false);
    }
  };

  const toggleMenu = () => {
    if (!disabled && !exporting) setShowMenu(prev => !prev);
  };

  return (
    <div className="relative" title={disabled ? tooltip : ''}>
      {/* TOMBOL UTAMA EXPORT */}
      <button
        onClick={toggleMenu}
        disabled={disabled || exporting}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 shadow-sm
          ${disabled || exporting 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none' 
            : 'bg-[#00A2E9] text-white hover:bg-[#008AC6] hover:-translate-y-[1px] hover:shadow-md border border-transparent'
          }
          ${exporting ? 'opacity-70' : ''}
        `}
      >
        <Download className="w-4 h-4" />
        {exporting ? 'Membuat gambar...' : 'Export'}
        
        {!disabled && !exporting && (
          <ChevronDown 
            className={`w-3.5 h-3.5 transition-transform duration-200 ${showMenu ? 'rotate-180' : 'rotate-0'}`} 
          />
        )}
      </button>

      {/* DROPDOWN MENU FORMAT */}
      {showMenu && !disabled && !exporting && (
        <div className="absolute top-[calc(100%+8px)] right-0 bg-white border border-[#E2E8F0] rounded-xl shadow-lg overflow-hidden min-w-[160px] z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
          {['png', 'jpg'].map((fmt, idx) => (
            <button 
              key={fmt}
              onClick={() => handleExport(fmt)}
              className={`w-full px-5 py-3 text-sm font-semibold text-left flex items-center gap-2.5 transition-colors cursor-pointer text-[#0F172A] hover:bg-[#00A2E9] hover:text-white group
                ${idx === 0 ? 'border-b border-[#E2E8F0]' : ''}
              `}
            >
              <Download className="w-4 h-4 text-[#64748B] group-hover:text-white transition-colors" />
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* BACKDROP (Buat nutup menu kalau diklik di luar) */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-[9998]" 
          onClick={() => setShowMenu(false)} 
        />
      )}
    </div>
  );
};

export default ExportButton;