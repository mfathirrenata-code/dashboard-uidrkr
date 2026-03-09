import React from 'react';

// IMPORT SEMUA MODUL LU DI SINI NANTINYA
import DashboardUIDRKR from "@/modules/KaliTransaksi/DashboardUIDRKR.jsx";
import RekapRealisasiUP3 from "@/modules/KaliTransaksi/RekapRealisasiUP3.jsx";
import RekapRealisasiULPKOM from "@/modules/KaliTransaksi/RekapRealisasiULPKOM.jsx";
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
        return <RekapRealisasiUP3 activeSubMenu={activeSubMenu} />;
        
      case 'REKAP REALISASI ULP KOM':
        return <RekapRealisasiULPKOM activeSubMenu={activeSubMenu} />;  
        
      // === MODUL RP TRANSAKSI ===
      case 'DASHBOARD RP':
        // return <DashboardRP activeSubMenu={activeSubMenu} />;
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