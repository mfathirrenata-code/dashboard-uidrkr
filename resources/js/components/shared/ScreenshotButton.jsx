import React, { useState } from 'react';
import { toPng } from 'html-to-image';

export default function ScreenshotButton({ 
  targetRef, 
  fileName = 'Screenshot.png', 
  buttonText = 'Screenshot',
  onStateChange,
  // 1. TAMBAH PROPS CLASSNAME (Default ukurannya kecil biar kelas lain aman)
  className = "px-3 py-1.5 text-xs" 
}) {
  const [isScreenshotting, setIsScreenshotting] = useState(false);

  const handleDownloadScreenshot = () => {
    if (!targetRef || !targetRef.current) {
      alert("Target screenshot tidak ditemukan!");
      return;
    }

    setIsScreenshotting(true);
    if (onStateChange) onStateChange(true);

    setTimeout(async () => {
      try {
        const dataUrl = await toPng(targetRef.current, { 
          quality: 1.0, 
          backgroundColor: "#ffffff", 
          pixelRatio: 2 
        });
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = fileName;
        link.click();
      } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan saat mengambil screenshot.");
      } finally {
        setIsScreenshotting(false);
        if (onStateChange) onStateChange(false);
      }
    }, 300);
  };

  return (
    <button 
      onClick={handleDownloadScreenshot} 
      disabled={isScreenshotting}
      className={`flex items-center justify-center gap-2 bg-[#00A2E9] hover:bg-[#008CC9] text-white font-bold rounded-xl transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
      {isScreenshotting ? (
        <span className="animate-pulse">Menyiapkan...</span>
      ) : (
        <>
          {/* IKON UNDUH / DOWNLOAD BARU */}
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2.5} 
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
            />
          </svg>
          {buttonText}
        </>
      )}
    </button>
  );
}