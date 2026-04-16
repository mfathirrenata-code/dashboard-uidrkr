import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import Header from './header';
import MainContent from './mainContent';

export default function Dashboard() {
  
  const appCategories = [
    {
      title: 'LINK LAPORAN',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>,
      menus: [
        { 
          id: 'll-1', 
          label: 'BUKA LINK LAPORAN', 
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>,
          subMenus: []
        }
      ]
    },
    {
      title: 'YAN GAN',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>,
      menus: [
        {
          id: 'kali-transaksi', label: 'KALI TRANSAKSI',
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
          id: 'rp-transaksi', label: 'RP TRANSAKSI',
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
          id: 'transaksi-pegawai', label: 'TRANSAKSI PEGAWAI',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>,
          subMenus: [
            { id: 'tp-1', label: 'LAPORAN TRANS PEGAWAI' },
            { id: 'tp-2', label: 'MONITORING TRANS' },
          ],
        },
        {
          id: 'rating-pln', label: 'RATING PLN MOBILE',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>,
          subMenus: [
            { id: 'rt-1', label: 'KINERJA RATING' },
            { id: 'rt-2', label: 'MONITORING RATING HARIAN' },
          ],
        },
        {
          id: 'rpt-keluhan', label: 'RPT KELUHAN',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>,
          subMenus: [
            { id: 'rpt-1', label: 'REKAP KELUHAN UP3' },
          ],
        },
        {
          id: 'spklu', label: 'SPKLU',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>,
          subMenus: [
            { id: 'spklu-1', label: 'DASHBOARD SPKLU' },
            { id: 'spklu-2', label: 'MONITORING SPKLU' },
          ],
        }
      ]
    },
    {
      title: 'PAE',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
      menus: [
        {
          id: 'pae-sm', label: 'LAPORAN STAKEHOLDER MANAGEMENT',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>,
          subMenus: [
            { id: 'pae-1', label: 'DASHBOARD UIDRKR' },
            { id: 'pae-2', label: 'DASHBOARD UP3 PKU' },
            { id: 'pae-3', label: 'DASHBOARD UP3 DMI' },
            { id: 'pae-4', label: 'DASHBOARD UP3 TPI' },
            { id: 'pae-5', label: 'DASHBOARD UP3 RGT' },
            { id: 'pae-6', label: 'DASHBOARD UP3 BKN' },
            { id: 'pae-7', label: 'MONITORING ULP' },
            { id: 'pae-8', label: 'LAPORAN STAKEHOLDER' },
          ]
        },
        {
          id: 'pae-ktt', label: 'LAPORAN KTT',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>,
          subMenus: [
            { id: 'pae-ktt-1', label: 'DASHBOARD KTT' } 
          ]
        }
      ]
    },
    {
      title: 'SAR',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>,
      menus: [
        {
          id: 'sar-1', label: 'DASHBOARD PERMASARAN',
          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>,
          subMenus: []
        }
      ]
    },
    {
      title: 'MAN TAN',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
      menus: [
        { id: 'mt-1', label: 'DASHBOARD CASH IN UIDRKR', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>, subMenus: [] },
        { id: 'mt-2', label: 'DASHBOARD CASH IN UP3', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>, subMenus: [] },
        { id: 'mt-3', label: 'DASHBOARD CASH IN ULP', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>, subMenus: [] },
      ]
    },
    {
      title: 'NKO NIAGA MP',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>,
      menus: [
        { id: 'nko-1', label: 'DASHBOARD NKO', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>, subMenus: [] }
      ]
    }
  ];

  // STATE 1: Untuk Buka/Tutup Kategori Utama (YAN GAN, PAE, dll)
  const [expandedCategories, setExpandedCategories] = useState(() => {
    const saved = localStorage.getItem('expandedCategories');
    if (saved) return JSON.parse(saved);
    return ['YAN GAN']; // Default terbuka
  });

  // STATE 2: Untuk Buka/Tutup Menu Level 2 (KALI TRANSAKSI, dll)
  const [expandedMenu, setExpandedMenu] = useState(() => {
    const saved = localStorage.getItem('expandedMenu');
    if (saved) return JSON.parse(saved);
    return ['kali-transaksi']; 
  }); 

  // STATE 3: Untuk Highlight Halaman yang Aktif
  const [activeSubMenu, setActiveSubMenu] = useState(() => {
    const saved = localStorage.getItem('activeSubMenu');
    if (saved) return JSON.parse(saved);
    return { parentLabel: 'KALI TRANSAKSI', childLabel: 'DASHBOARD UIDRKR' };
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('expandedCategories', JSON.stringify(expandedCategories));
  }, [expandedCategories]);

  useEffect(() => {
    localStorage.setItem('expandedMenu', JSON.stringify(expandedMenu));
  }, [expandedMenu]);

  useEffect(() => {
    localStorage.setItem('activeSubMenu', JSON.stringify(activeSubMenu));
  }, [activeSubMenu]);

  // LOGIKA TOGGLE KATEGORI UTAMA (Level 1)
  const toggleCategory = (title) => {
    setExpandedCategories(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  // LOGIKA TOGGLE MENU (Level 2)
  const toggleMenu = (menuId, label, hasSubMenus) => {
    setExpandedMenu((prev) => {
      if (prev.includes(menuId)) return prev.filter((id) => id !== menuId);
      return [...prev, menuId];
    });

    if (!hasSubMenus) {
      setActiveSubMenu({ parentLabel: label, childLabel: '' });
      setIsSidebarOpen(false);
    }
  };

  // LOGIKA KLIK SUB MENU (Level 3)
  const handleSubMenuClick = (parentLabel, childLabel) => {
    setActiveSubMenu({ parentLabel, childLabel });
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans antialiased text-gray-800 overflow-hidden">
      
      <Sidebar 
        categories={appCategories} 
        expandedCategories={expandedCategories}
        expandedMenu={expandedMenu}
        activeSubMenu={activeSubMenu}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        toggleCategory={toggleCategory}
        toggleMenu={toggleMenu}
        handleSubMenuClick={handleSubMenuClick}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header activeSubMenu={activeSubMenu} setIsSidebarOpen={setIsSidebarOpen} />
        <MainContent activeSubMenu={activeSubMenu} categories={appCategories} />
      </div>

    </div>
  );
}