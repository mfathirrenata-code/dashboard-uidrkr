import React from 'react';

import DashboardUIDRKR from "@/modules/Niaga_MP/YanGan/KaliTransaksi/DashboardUIDRKR.jsx";
import RealisasiUP3 from "@/modules/Niaga_MP/YanGan/KaliTransaksi/RealisasiUP3.jsx";
import RealisasiULPKOM from "@/modules/Niaga_MP/YanGan/KaliTransaksi/RealisasiULPKOM.jsx";
import RealisasiULP from "@/modules/Niaga_MP/YanGan/KaliTransaksi/RealisasiULP.jsx";
import DataPusat from "@/modules/Niaga_MP/YanGan/KaliTransaksi/DataPusat.jsx";
import Placeholder from "@/components/shared/Placeholder.jsx";
import KinerjaRating from "@/modules/Niaga_MP/YanGan/RatingPLNMobile/KinerjaRating.jsx";
import Rating from "@/modules/Niaga_MP/YanGan/RatingPLNMobile/RatingHarian.jsx";
import DashboardSPKLU from "@/modules/Niaga_MP/YanGan/SPKLU/DashboardSPKLU.jsx";
import MonitoringSPKLU from "@/modules/Niaga_MP/YanGan/SPKLU/MonitoringSPKLU.jsx";
import DashboardRP from "@/modules/Niaga_MP/YanGan/RupiahTransaksi/DashboardRP.jsx";
import RekapRPUP3KOM from "@/modules/Niaga_MP/YanGan/RupiahTransaksi/RekapRPUP3KOM.jsx";
import RekapRPUP3 from "@/modules/Niaga_MP/YanGan/RupiahTransaksi/RekapRPUP3.jsx";
import RekapRPULPKOM from "@/modules/Niaga_MP/YanGan/RupiahTransaksi/RekapRPULPKOM.jsx";
import RekapRPULP from "@/modules/Niaga_MP/YanGan/RupiahTransaksi/RekapRPULP.jsx";
import MonitoringRP from '@/modules/Niaga_MP/YanGan/RupiahTransaksi/MonitoringRP.jsx';

export default function MainContent({ activeSubMenu }) {
  
  const renderContent = () => {
    const { parentLabel, childLabel } = activeSubMenu;

    // ==========================================
    // 1. KELOMPOK: KALI TRANSAKSI
    // ==========================================
    if (parentLabel === 'KALI TRANSAKSI') {
      switch (childLabel) {
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
        // Antisipasi dua nama agar tetap match
        case 'MONITORING DATA PUSAT':
        case 'MONITORING RP - DATA PUSAT':
          return <DataPusat activeSubMenu={activeSubMenu} />;
        default:
          return <Placeholder activeSubMenu={activeSubMenu} />;
      }
    }

    // ==========================================
    // 2. KELOMPOK: RP TRANSAKSI
    // ==========================================
    else if (parentLabel === 'RP TRANSAKSI') {
      switch (childLabel) {
        case 'DASHBOARD RP':
          return <DashboardRP activeSubMenu={activeSubMenu} />;
        case 'REKAP RP UP3 KOM':
          return <RekapRPUP3KOM activeSubMenu={activeSubMenu} />;
        case 'REKAP RP UP3':
          return <RekapRPUP3 activeSubMenu={activeSubMenu} />;
        case 'REKAP RP ULP KOM':
          return <RekapRPULPKOM activeSubMenu={activeSubMenu} />;
        case 'REKAP RP ULP':
          return <RekapRPULP activeSubMenu={activeSubMenu} />;
        case 'MONITORING RP - DATA PUSAT':
          return <MonitoringRP activeSubMenu={activeSubMenu} />;
        default:
          return <Placeholder activeSubMenu={activeSubMenu} />;
      }
    }

    // ==========================================
    // 3. KELOMPOK: RATING PLN MOBILE
    // ==========================================
    else if (parentLabel === 'RATING PLN MOBILE') {
      switch (childLabel) {
        case 'KINERJA RATING':
          return <KinerjaRating activeSubMenu={activeSubMenu} />;
        case 'MONITORING RATING HARIAN':
          return <Rating activeSubMenu={activeSubMenu} />;
        default:
          return <Placeholder activeSubMenu={activeSubMenu} />;
      }
    }

    // ==========================================
    // 4. KELOMPOK: SPKLU
    // ==========================================
    else if (parentLabel === 'SPKLU') {
      switch (childLabel) {
        case 'DASHBOARD SPKLU':
          return <DashboardSPKLU activeSubMenu={activeSubMenu} />;
        case 'MONITORING SPKLU':
          return <MonitoringSPKLU activeSubMenu={activeSubMenu} />;
        default:
          return <Placeholder activeSubMenu={activeSubMenu} />;
      }
    }

    // ==========================================
    // 5. KELOMPOK: PAE / SAR / DLL (Tinggal tambahkan nanti di sini)
    // ==========================================
    else if (parentLabel === 'PAE') {
      return <Placeholder activeSubMenu={activeSubMenu} />;
    }

    // Default jika tidak ada modul yang cocok
    return <Placeholder activeSubMenu={activeSubMenu} />;
  };

  return (
    <>
      {renderContent()}
    </>
  );
}