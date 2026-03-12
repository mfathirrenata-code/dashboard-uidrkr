import React from 'react';

export default function Sidebar({ menus, expandedMenu, activeSubMenu, isSidebarOpen, setIsSidebarOpen, toggleMenu, handleSubMenuClick }) {
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
        className={`fixed inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Sidebar (Logo PLN & Judul Dashboard) */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <img 
              src="/logo_pln.png" 
              alt="Logo PLN" 
              className="w-8 h-8 object-contain shrink-0" 
            />
            <h1 className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#007EA7] to-[#00A2E9]">
              UIDRKR <span className="font-medium text-gray-500 tracking-normal text-base ml-1">dashboard</span>
            </h1>
          </div>

          <button 
            className="md:hidden text-gray-400 hover:text-red-500 transition-colors"
            onClick={() => setIsSidebarOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Daftar Menu */}
        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <div className="px-6 mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fokus Utama</p>
          </div>
          
          <div className="px-3">
            <div className="bg-[#F4F9FF] rounded-xl pb-3 border border-[#E0F0FF]">
              <div className="px-4 py-4 flex items-center text-[#007EA7] font-bold text-lg mb-2 border-b border-[#E0F0FF]">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                YAN GAN
              </div>
              
              <ul className="space-y-1 px-3">
                {menus.map((menu) => {
                  const isExpanded = expandedMenu.includes(menu.id);
                  const hasSubMenus = menu.subMenus && menu.subMenus.length > 0;

                  return (
                    <li key={menu.id} className="mb-1">
                      <button
                        onClick={() => toggleMenu(menu.id, menu.label, hasSubMenus)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-all duration-200 ease-in-out ${
                          isExpanded 
                            ? 'bg-[#00A2E9] text-white font-semibold shadow-md translate-x-1' 
                            : 'text-gray-600 hover:bg-[#E0F4FF] hover:text-[#00A2E9] font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 pr-2">
                          <span className={`shrink-0 ${isExpanded ? 'text-white' : 'text-[#00A2E9]'}`}>
                            {menu.icon}
                          </span>
                          <span className="text-left whitespace-normal leading-snug">
                            {menu.label}
                          </span>
                        </div>

                        {hasSubMenus && (
                          <svg className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        )}
                      </button>

                      {hasSubMenus && (
                        <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-1.5 pb-2' : 'grid-rows-[0fr] opacity-0'}`}>
                          <div className="overflow-hidden">
                            {/* Garis pinggir submenu disamakan dengan warna cyan menu utama dengan opacity sedikit turun */}
                            <ul className="ml-[2.25rem] pl-4 border-l-2 border-[#00A2E9]/40 space-y-1.5">
                              {menu.subMenus.map((subMenu) => {
                                const isActiveChild = activeSubMenu.childLabel === subMenu.label;
                                return (
                                  <li key={subMenu.id}>
                                    <button
                                      onClick={() => handleSubMenuClick(menu.label, subMenu.label)}
                                      className={`w-full text-left whitespace-normal leading-snug px-3 py-2.5 text-xs rounded-md transition-all duration-200 ${
                                        isActiveChild 
                                          // Submenu Aktif: Background biru muda lebih pekat, teks biru tua tegas
                                          ? 'bg-[#C2EBFF] text-[#006B99] font-bold shadow-sm' 
                                          // Submenu Tidak Aktif: Hover konsisten dengan menu utama
                                          : 'text-[#64748B] hover:bg-[#E0F4FF] hover:text-[#00A2E9]'
                                      }`}
                                    >
                                      {subMenu.label}
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
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}