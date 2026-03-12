import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import Header from './header';
import MainContent from './maincontent';

export default function Dashboard() {
  const yanGanMenus = [
    {
      id: 'kali-transaksi',
      label: 'KALI TRANSAKSI',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>,
      subMenus: [
        { id: 'kt-1', label: 'DASHBOARD UIDRKR' },
        { id: 'kt-2', label: 'REKAP TRANS UP3 KOM' },
        { id: 'kt-3', label: 'REKAP REALISASI UP3' },
        { id: 'kt-4', label: 'REKAP REALISASI ULP KOM' },
        { id: 'kt-5', label: 'REKAP REALISASI ULP' },
        { id: 'kt-6', label: 'MONITORING RP - DATA PUSAT' },
      ],
    },
    {
      id: 'rp-transaksi',
      label: 'RP TRANSAKSI',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
      subMenus: [
        { id: 'rp-1', label: 'DASHBOARD RP' },
        { id: 'rp-2', label: 'REKAP RP UP3 KOM' },
        { id: 'rp-3', label: 'REKAP RP UP3' },
        { id: 'rp-4', label: 'REKAP RP ULP KOM' },
        { id: 'rp-5', label: 'REKAP RP ULP' },
        { id: 'rp-6', label: 'MONITORING RP - DATA PUSAT' },
      ],
    },
    {
      id: 'transaksi-pegawai',
      label: 'TRANSAKSI PEGAWAI',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>,
      subMenus: [
        { id: 'tp-1', label: 'LAPORAN TRANS PEGAWAI' },
        { id: 'tp-2', label: 'MONITORING TRANS' },
      ],
    },
    {
      id: 'rating-pln',
      label: 'RATING PLN MOBILE',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>,
      subMenus: [
        { id: 'rt-1', label: 'KINERJA RATING' },
        { id: 'rt-2', label: 'MONITORING RATING PER 1-15' },
        { id: 'rt-3', label: 'MONITORING RATING PER 16-31' },
      ],
    },
    {
      id: 'rpt-keluhan',
      label: 'RPT KELUHAN',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>,
      subMenus: [
        { id: 'rpt-1', label: 'REKAP KELUHAN UP3' },
      ],
    },
    {
      id: 'spklu',
      label: 'SPKLU',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>,
      subMenus: [
        { id: 'spklu-1', label: 'DASHBOARD SPKLU' },
        { id: 'spklu-2', label: 'MONITORING SPKLU' },
      ],
    },
    {
      id: 'indeks-kepuasan',
      label: 'INDEKS KEPUASAN PELANGGAN',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
      subMenus: [], 
    },
  ];

  // 2. States (Kondisi Aplikasi) - Sekarang pakai localStorage!
  
  // State untuk nyimpen menu apa aja yang lagi "buka" (dropdown-nya kebawah)
  const [expandedMenu, setExpandedMenu] = useState(() => {
    const savedExpanded = localStorage.getItem('expandedMenu');
    if (savedExpanded) {
      return JSON.parse(savedExpanded);
    }
    // Default pas pertama kali buka: 'kali-transaksi' langsung kebuka
    return ['kali-transaksi']; 
  }); 

  // State untuk nyimpen halaman mana yang lagi aktif
  const [activeSubMenu, setActiveSubMenu] = useState(() => {
    const savedActive = localStorage.getItem('activeSubMenu');
    if (savedActive) {
      return JSON.parse(savedActive);
    }
    // Default pas pertama kali buka: langsung nembak ke Dashboard UIDRKR
    return {
      parentLabel: 'KALI TRANSAKSI',
      childLabel: 'DASHBOARD UIDRKR'
    };
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 3. Efek untuk nulis ke localStorage tiap kali state berubah
  useEffect(() => {
    localStorage.setItem('expandedMenu', JSON.stringify(expandedMenu));
  }, [expandedMenu]);

  useEffect(() => {
    localStorage.setItem('activeSubMenu', JSON.stringify(activeSubMenu));
  }, [activeSubMenu]);


  // 4. Fungsi Logika
  const toggleMenu = (menuId, label, hasSubMenus) => {
    setExpandedMenu((prevExpanded) => {
      if (prevExpanded.includes(menuId)) {
        return prevExpanded.filter((id) => id !== menuId);
      }
      return [...prevExpanded, menuId];
    });

    if (!hasSubMenus) {
      setActiveSubMenu({ parentLabel: label, childLabel: '' });
      setIsSidebarOpen(false);
    }
  };

  const handleSubMenuClick = (parentLabel, childLabel) => {
    setActiveSubMenu({ parentLabel, childLabel });
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans antialiased text-gray-800 overflow-hidden">
      
      {/* Melempar (Passing Props) Data & Fungsi ke Sidebar */}
      <Sidebar 
        menus={yanGanMenus}
        expandedMenu={expandedMenu}
        activeSubMenu={activeSubMenu}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        toggleMenu={toggleMenu}
        handleSubMenuClick={handleSubMenuClick}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header hanya butuh info menu aktif dan fungsi buka sidebar */}
        <Header 
          activeSubMenu={activeSubMenu} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />
        
        {/* Main Content butuh info menu aktif dan daftar menu (untuk ambil icon) */}
        <MainContent 
          activeSubMenu={activeSubMenu} 
          menus={yanGanMenus} 
        />
      </div>

    </div>
  );
}