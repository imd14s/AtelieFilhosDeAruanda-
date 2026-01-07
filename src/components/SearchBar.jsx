import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ searchTerm, setSearchTerm, onSearch, isMobile }) => {
  // Classes otimizadas para cada contexto
  const desktopClasses = "w-full bg-transparent border-b border-[#0f2A44]/20 py-2 pl-2 pr-10 font-lato text-sm focus:outline-none focus:border-[#C9A24D] transition-all duration-300 placeholder:text-[#0f2A44]/40 placeholder:font-light";
  
  const mobileClasses = "w-full bg-white border border-[#0f2A44]/10 rounded-none py-3 pl-4 pr-12 font-lato text-xs focus:outline-none focus:border-[#C9A24D] shadow-sm appearance-none";

  return (
    <form 
      onSubmit={onSearch} 
      className={`relative w-full group transition-all duration-500 ${!isMobile ? 'max-w-md' : ''}`}
    >
      <input 
        type="text" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={isMobile ? "O QUE VOCÊ BUSCA?" : "Busque por axé e energia..."}
        className={isMobile ? mobileClasses : desktopClasses}
      />
      
      <button 
        type="submit" 
        aria-label="Buscar"
        className={`absolute right-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${
          isMobile 
            ? 'text-[#C9A24D]' 
            : 'text-[#0f2A44]/40 group-hover:text-[#0f2A44] group-focus-within:text-[#C9A24D]'
        }`}
      >
        <Search size={isMobile ? 18 : 20} strokeWidth={1.5} />
      </button>

      {/* Linha decorativa de foco (apenas Desktop) */}
      {!isMobile && (
        <span className="absolute bottom-0 left-1/2 w-0 h-[1.5px] bg-[#C9A24D] transition-all duration-500 group-focus-within:w-full group-focus-within:left-0"></span>
      )}
    </form>
  );
};

export default SearchBar;