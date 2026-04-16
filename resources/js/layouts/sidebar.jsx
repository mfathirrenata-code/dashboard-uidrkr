import React, { useState, useRef, useEffect } from 'react';

// ── 1. KONFIGURASI MULTI-PROJECT ────────────────────────────────────────────
const PROJECTS = [
  {
    id: 'niaga-mp',
    name: 'NIAGA MP',
    desc: 'Dashboard UIDRKR',
    logo: '/logo_pln.png',
    url: '/niaga-mp/dashboard' // Sesuaikan dengan route di Laravel kamu
  },
  {
    id: 'crm-niaga',
    name: 'CRM Niaga',
    desc: 'Customer Relationship',
    logo: '/logo_pln.png',
    url: '/crm/dashboard' // Sesuaikan dengan route di Laravel kamu
  }
];

export default function Sidebar({
  categories,
  expandedCategories,
  expandedMenu,
  activeSubMenu,
  isSidebarOpen,
  setIsSidebarOpen,
  toggleCategory,
  toggleMenu,
  handleSubMenuClick
}) {

  // ==========================================
  // STATE UNTUK PROJECT SWITCHER
  // ==========================================
  const [activeProjectId, setActiveProjectId] = useState('niaga-mp');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentProject = PROJECTS.find(p => p.id === activeProjectId) || PROJECTS[0];

  // Tutup dropdown jika klik di luar area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fungsi saat project diklik
  const handleProjectSwitch = (project) => {
    setActiveProjectId(project.id);
    setIsDropdownOpen(false);
    window.location.href = project.url;
  };

  return (
    <>
      {/* Overlay Gelap untuk Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Kontainer Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >

        {/* ========================================== */}
        {/* HEADER SIDEBAR DENGAN PROJECT SWITCHER */}
        {/* ========================================== */}
        <div className="relative border-b border-gray-200 bg-white shrink-0 px-4 py-3" ref={dropdownRef}>
          <div className="flex items-center justify-between">
            {/* Tombol Pembuka Dropdown */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="group flex-1 flex items-center justify-between p-2 rounded-xl hover:bg-blue-50/50 hover:shadow-sm hover:ring-1 hover:ring-blue-100 transition-all text-left relative"
              title="Klik untuk mengganti project"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 border border-gray-200 shadow-sm group-hover:border-blue-200 transition-colors">
                  <img src={currentProject.logo} alt="Logo" className="w-7 h-7 object-contain" />
                </div>
                <div>
                  <h1 className="text-[15px] font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#007EA7] to-[#00A2E9] leading-none group-hover:from-[#00A2E9] group-hover:to-[#00A2E9] transition-all">
                    {currentProject.name}
                  </h1>
                  <p className="text-[11px] font-medium text-slate-500 mt-1">
                    {currentProject.desc}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`p-1 rounded-md transition-colors ${isDropdownOpen ? 'bg-blue-100 text-[#00A2E9]' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-[#00A2E9]'}`}>
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Tombol Close Mobile */}
            <button
              className="md:hidden ml-2 text-gray-400 hover:text-red-500 transition-colors shrink-0 p-2"
              onClick={() => setIsSidebarOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu Dropdown Daftar Project */}
          {isDropdownOpen && (
            <div className="absolute top-[70px] left-4 right-4 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-[999] animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2 space-y-0.5">
                <p className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Pilih Project Anda
                </p>
                {PROJECTS.map(proj => {
                  const isActive = activeProjectId === proj.id;
                  return (
                    <button
                      key={proj.id}
                      onClick={() => handleProjectSwitch(proj)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${isActive
                          ? 'bg-[#E0F4FF] text-[#00A2E9]'
                          : 'hover:bg-slate-50 text-slate-600'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <img src={proj.logo} alt="Logo" className="w-5 h-5 object-contain" />
                        <span className={`text-[13px] ${isActive ? 'font-bold' : 'font-semibold'}`}>
                          {proj.name}
                        </span>
                      </div>
                      {isActive && (
                        <svg className="w-4 h-4 text-[#00A2E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* DAFTAR MENU DINAMIS */}
        {/* ========================================== */}
        <div className="flex-1 overflow-y-auto py-5 custom-scrollbar">
          <div className="px-3">
            {categories.map((category, catIdx) => {

              // STYLE KHUSUS: UNTUK "LINK LAPORAN"
              if (category.title === 'LINK LAPORAN') {
                const isActiveLink = activeSubMenu.parentLabel === category.title;
                return (
                  <div key={catIdx} className="mb-4">
                    <div className="px-2 pb-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Unggahan
                      </p>
                    </div>

                    <button
                      onClick={() => handleSubMenuClick(category.title, category.menus[0]?.label || '')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActiveLink
                          ? 'bg-[#E0F4FF] text-[#00A2E9] shadow-sm'
                          : 'bg-[#F8FAFC] text-slate-600 hover:bg-[#E0F4FF] hover:text-[#00A2E9]'
                        }`}
                    >
                      <span className={isActiveLink ? 'text-[#00A2E9]' : 'text-slate-400'}>
                        {category.icon}
                      </span>
                      <span className={`text-[14px] tracking-wide uppercase ${isActiveLink ? 'font-black' : 'font-bold'}`}>
                        {category.title}
                      </span>
                    </button>
                  </div>
                );
              }

              // NORMAL STYLE: UNTUK YAN GAN, PAE, SAR, DLL
              const isCatExpanded = expandedCategories.includes(category.title);

              return (
                <React.Fragment key={catIdx}>
                  {catIdx === 1 && (
                    <div className="px-2 pt-3 pb-2 mt-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Menu Utama
                      </p>
                    </div>
                  )}

                  <div className="mb-1">
                    <button
                      onClick={() => toggleCategory(category.title)}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[#00A2E9] transition-colors">
                          {category.icon}
                        </span>
                        <span className="font-bold text-[15px] tracking-wide text-[#007EA7] transition-colors">
                          {category.title}
                        </span>
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform duration-300 ${isCatExpanded ? 'rotate-90 text-[#00A2E9]' : 'text-[#00A2E9]/60'}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>

                    {/* LEVEL 2: MENUS */}
                    <div className={`grid transition-all duration-300 ease-in-out ${isCatExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <ul className="space-y-1 mt-1 px-1 ml-4">
                          {category.menus && category.menus.length > 0 ? (
                            category.menus.map((menu) => {
                              const isMenuExpanded = expandedMenu.includes(menu.id);
                              const hasSubMenus = menu.subMenus && menu.subMenus.length > 0;
                              const isActiveSingleMenu = !hasSubMenus && activeSubMenu.parentLabel === menu.label;
                              const isParentOfActiveChild = hasSubMenus && activeSubMenu.parentLabel === menu.label;

                              return (
                                <li key={menu.id} className="mb-1">
                                  <button
                                    onClick={() => toggleMenu(menu.id, menu.label, hasSubMenus)}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-[13.5px] rounded-lg transition-all duration-200 ease-in-out ${isMenuExpanded || isActiveSingleMenu || isParentOfActiveChild
                                        ? 'bg-[#E0F4FF] text-[#00A2E9] font-bold shadow-sm'
                                        : 'text-slate-600 hover:bg-[#E0F4FF] hover:text-[#00A2E9] font-semibold'
                                      }`}
                                  >
                                    <span className="text-left whitespace-normal leading-snug">
                                      {menu.label}
                                    </span>

                                    {hasSubMenus && (
                                      <svg className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ${isMenuExpanded ? 'rotate-90 text-[#00A2E9]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
                                      </svg>
                                    )}
                                  </button>

                                  {/* LEVEL 3: SUB-MENUS */}
                                  {hasSubMenus && (
                                    <div className={`grid transition-all duration-300 ease-in-out ${isMenuExpanded ? 'grid-rows-[1fr] opacity-100 mt-1.5 pb-2' : 'grid-rows-[0fr] opacity-0'}`}>
                                      <div className="overflow-hidden">
                                        <ul className="ml-[1.2rem] pl-3.5 border-l-2 border-slate-200 space-y-0.5">
                                          {menu.subMenus.map((subMenu) => {

                                            const isActiveChild = activeSubMenu.parentLabel === menu.label && activeSubMenu.childLabel === subMenu.label;

                                            return (
                                              <li key={subMenu.id}>
                                                <button
                                                  onClick={() => handleSubMenuClick(menu.label, subMenu.label)}
                                                  className={`w-full text-left flex items-center gap-2 whitespace-normal leading-snug px-3 py-2 text-[12.5px] rounded-md transition-all duration-200 ${isActiveChild
                                                      ? 'text-[#00A2E9] font-bold bg-transparent'
                                                      : 'text-slate-500 font-medium hover:bg-slate-100 hover:text-slate-800'
                                                    }`}
                                                >
                                                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActiveChild ? 'bg-[#00A2E9]' : 'bg-transparent'}`} />
                                                  <span>{subMenu.label}</span>
                                                </button>
                                              </li>
                                            );
                                          })}
                                        </ul>
                                      </div>
                                    </div>
                                  )}
                                </li>
                              );
                            })
                          ) : (
                            <li className="px-4 py-2 text-xs text-gray-400 font-medium italic">Tidak ada menu</li>
                          )}
                        </ul>
                      </div>
                    </div>

                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}