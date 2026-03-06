import React from 'react';

// IMPORT SEMUA MODUL LU DI SINI NANTINYA
import DashboardUIDRKR from "@/modules/KaliTransaksi/DashboardUIDRKR.jsx";
import Placeholder from "@/Shared/Placeholder.jsx";

export default function MainContent({ activeSubMenu }) {
  
  // FUNGSI UNTUK MENGARAHKAN HALAMAN
  const renderContent = () => {
    switch (activeSubMenu.childLabel) {
      
      // === MODUL KALI TRANSAKSI ===
      case 'DASHBOARD UIDRKR':
        return <DashboardUIDRKR activeSubMenu={activeSubMenu} />;
      
      case 'REKAP TRANS UP3 KOM':
        // Nanti kalau temen lu udah kelar bikin komponennya, lu tinggal panggil:
        // return <RekapTransUP3Kom activeSubMenu={activeSubMenu} />;
        return <Placeholder activeSubMenu={activeSubMenu} />; // Sementara dipakein placeholder
        
      // === MODUL RP TRANSAKSI ===
      case 'DASHBOARD RP':
        // return <DashboardRP activeSubMenu={activeSubMenu} />;
        return <Placeholder activeSubMenu={activeSubMenu} />;

      // DEFAULT JIKA MENU BELUM DIBIKIN KODENYA
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