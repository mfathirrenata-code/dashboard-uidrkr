import React from 'react';

// IMPORT SEMUA MODUL LU DI SINI NANTINYA
import DashboardUIDRKR from "@/modules/KaliTransaksi/DashboardUIDRKR.jsx";
import RealisasiUP3 from "@/modules/KaliTransaksi/RealisasiUP3.jsx";
import RealisasiULPKOM from "@/modules/KaliTransaksi/RealisasiULPKOM.jsx";
import RealisasiULP from "@/modules/KaliTransaksi/RealisasiULP.jsx";
import DataPusat from "@/modules/KaliTransaksi/DataPusat.jsx";
import Placeholder from "@/Shared/Placeholder.jsx";


export default function MainContent({ activeSubMenu }) {
  
  // FUNGSI UNTUK MENGARAHKAN HALAMAN
  const renderContent = () => {
    switch (activeSubMenu.childLabel) {
      
      // === MODUL KALI TRANSAKSI ===
      case 'DASHBOARD UIDRKR':
        return <DashboardUIDRKR activeSubMenu={activeSubMenu} />;
      
      case 'REKAP TRANS UP3 KOM':
        return <Placeholder activeSubMenu={activeSubMenu} />;
        
      case 'REKAP REALISASI UP3':
        return <RealisasiUP3 activeSubMenu={activeSubMenu} />;
        
      case 'REKAP REALISASI ULP KOM':
        return <RealisasiULPKOM activeSubMenu={activeSubMenu} />;
        
      case 'REKAP REALISASI ULP':
        return <RealisasiULP activeSubMenu={activeSubMenu} />;

      case 'MONITORING RP - DATA PUSAT':
        return <DataPusat activeSubMenu={activeSubMenu} />;
        
      // === MODUL RP TRANSAKSI ===
      case 'DASHBOARD RP':
        return <Placeholder activeSubMenu={activeSubMenu} />;

      default:
        return <Placeholder activeSubMenu={activeSubMenu} />;
    }
  };

  return (
    <>
      {renderContent()}
    </>
  );
}