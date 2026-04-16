// File: src/components/Pagination.jsx
import React from 'react';

export default function Pagination({ totalItems, itemsPerPage, currentPage, setCurrentPage }) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  if (totalItems === 0) return null;

  return (
    <div className="p-4 border-t border-[#E2E8F0] bg-white flex items-center justify-between">
      <button onClick={prevPage} disabled={currentPage === 1} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'border hover:bg-gray-50'}`}>Sebelumnya</button>
      <div className="flex gap-1 hidden sm:flex">
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
          .map((page, index, array) => (
            <React.Fragment key={page}>
              {index > 0 && array[index - 1] !== page - 1 && <span className="px-2 py-1 text-gray-400">...</span>}
              <button 
                onClick={() => setCurrentPage(page)} 
                className={`w-8 h-8 rounded-lg font-bold text-sm ${currentPage === page ? 'bg-[#00A2E9] text-white' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                {page}
              </button>
            </React.Fragment>
          ))}
      </div>
      <button onClick={nextPage} disabled={currentPage === totalPages} className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'border hover:bg-gray-50'}`}>Selanjutnya</button>
    </div>
  );
}