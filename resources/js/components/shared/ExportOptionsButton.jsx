import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export default function ExportOptionsButton({ 
  targetRef, 
  fileName = 'Data_Realisasi', 
  buttonText = 'Export',
  onStateChange,
  className = "px-3 py-1.5 text-xs" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState(''); 
  
  const dropdownRef = useRef(null);

  // Tutup dropdown jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================
  const validateTarget = () => {
    if (!targetRef || !targetRef.current) {
      alert("Target area tidak ditemukan!");
      return false;
    }
    return true;
  };

  const startExport = (type, isFullTable = false) => {
    setIsOpen(false);
    setIsExporting(true);
    setExportType(type);
    if (isFullTable && onStateChange) onStateChange(true);
  };

  const endExport = (isFullTable = false) => {
    setIsExporting(false);
    setExportType('');
    if (isFullTable && onStateChange) onStateChange(false);
  };

  const triggerDownload = (url, name) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================
  // 1. LOGIKA EXPORT KE PDF (Auto Slicing)
  // ==========================================
  const handleExportPDF = () => {
    if (!validateTarget()) return;

    // Hanya ambil tabel, buang header/judul luar
    const tableElement = targetRef.current.querySelector('table');
    if (!tableElement) {
      alert("Elemen tabel tidak ditemukan untuk export PDF!");
      return;
    }
    
    startExport('PDF (Seluruh Data)...', true);

    setTimeout(async () => {
      try {
        const dataUrl = await toPng(tableElement, { 
          quality: 1.0, 
          backgroundColor: "#ffffff", 
          pixelRatio: 2 
        });

        const pdf = new jsPDF('l', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgProps = pdf.getImageProperties(dataUrl);
        const margin = 10; 
        const contentWidth = pdfWidth - (2 * margin);
        const contentHeight = (imgProps.height * contentWidth) / imgProps.width;

        let heightLeft = contentHeight;
        let position = margin;

        // Halaman 1
        pdf.addImage(dataUrl, 'PNG', margin, position, contentWidth, contentHeight);
        heightLeft -= (pdfHeight - (margin * 2));

        // Jika gambar masih sisa, buat halaman baru (Loop Slicing)
        while (heightLeft > 0) {
          position = heightLeft - contentHeight + margin;
          pdf.addPage();
          pdf.addImage(dataUrl, 'PNG', margin, position, contentWidth, contentHeight);
          heightLeft -= (pdfHeight - (margin * 2));
        }

        pdf.save(`${fileName}_Full_Berhalaman.pdf`);
      } catch (err) {
        console.error(err);
        alert(`Terjadi kesalahan saat mengekspor ke PDF.`);
      } finally {
        endExport(true);
      }
    }, 1500); 
  };

  // ==========================================
  // 2. LOGIKA EXPORT KE CSV
  // ==========================================
  const handleExportCSV = () => {
    if (!validateTarget()) return;
    startExport('CSV...', false); 

    setTimeout(() => {
      try {
        const table = targetRef.current.querySelector('table');
        if (!table) {
          alert("Tidak ada tabel yang ditemukan untuk di-export!");
          endExport(false);
          return;
        }

        let csvContent = "";
        const rows = table.querySelectorAll("tr");

        rows.forEach((row) => {
          const cols = row.querySelectorAll("td, th");
          const rowData = Array.from(cols).map(col => {
            let data = col.innerText.replace(/(\r\n|\n|\r)/gm, " ").trim();
            data = data.replace(/"/g, '""'); 
            return `"${data}"`; 
          });
          csvContent += rowData.join(",") + "\n";
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        triggerDownload(url, `${fileName}.csv`);
      } catch (err) {
        console.error(err);
        alert(`Terjadi kesalahan saat mengekspor ke CSV.`);
      } finally {
        endExport(false);
      }
    }, 100);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        disabled={isExporting}
        className={`flex items-center justify-center gap-2 bg-[#00A2E9] hover:bg-[#008CC9] text-white font-bold transition-all shadow-sm disabled:opacity-70 disabled:cursor-wait ${className}`}
      >
        {isExporting ? (
          <span className="animate-pulse">{exportType}</span>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {buttonText}
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {isOpen && !isExporting && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E2E8F0] z-[999] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-1 flex flex-col text-[13px] font-medium text-[#475569]">
            
            <button onClick={handleExportCSV} className="w-full text-left px-4 py-2.5 hover:bg-[#F8FAFC] hover:text-[#00A2E9] transition-colors flex items-center gap-2.5">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Google Sheets (CSV)
            </button>
            
            <button onClick={handleExportPDF} className="w-full text-left px-4 py-2.5 hover:bg-[#F8FAFC] hover:text-[#00A2E9] transition-colors flex items-center gap-2.5">
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PDF
            </button>

          </div>
        </div>
      )}
    </div>
  );
}