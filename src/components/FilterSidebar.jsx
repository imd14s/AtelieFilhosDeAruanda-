import React from 'react';
import { X, ChevronRight } from 'lucide-react';

const FilterSidebar = ({ isOpen, onClose, collections, activeCategory, onSelectCategory }) => {
  return (
    <>
      {/* Overlay escuro quando o menu está aberto */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Barra Lateral */}
      <div className={`fixed top-0 right-0 h-full w-[300px] bg-[#F7F7F4] z-50 shadow-2xl transform transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 flex flex-col h-full">
          
          <div className="flex justify-between items-center mb-12">
            <h2 className="font-playfair text-2xl text-[#0f2A44]">Filtros</h2>
            <button onClick={onClose} className="p-2 hover:bg-[#0f2A44]/5 rounded-full transition-colors">
              <X size={20} className="text-[#0f2A44]" />
            </button>
          </div>

          <div className="space-y-10">
            {/* Seção de Categorias */}
            <div>
              <h3 className="font-lato text-[10px] uppercase tracking-[0.2em] text-[#C9A24D] mb-6">Categorias</h3>
              <ul className="space-y-4">
                <li>
                  <button 
                    onClick={() => { onSelectCategory(null); onClose(); }}
                    className={`flex items-center justify-between w-full font-lato text-sm uppercase tracking-widest transition-all ${!activeCategory ? 'text-[#0f2A44] font-bold' : 'text-[#0f2A44]/40 hover:text-[#0f2A44]'}`}
                  >
                    Todos os Itens
                    {!activeCategory && <ChevronRight size={14} />}
                  </button>
                </li>
                {collections.map((col) => (
                  <li key={col._id}>
                    <button 
                      onClick={() => { onSelectCategory(col.slug); onClose(); }}
                      className={`flex items-center justify-between w-full font-lato text-sm uppercase tracking-widest transition-all ${activeCategory === col.slug ? 'text-[#0f2A44] font-bold' : 'text-[#0f2A44]/40 hover:text-[#0f2A44]'}`}
                    >
                      {col.name}
                      {activeCategory === col.slug && <ChevronRight size={14} />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Seção de Ordenação (Exemplo) */}
            <div>
              <h3 className="font-lato text-[10px] uppercase tracking-[0.2em] text-[#C9A24D] mb-6">Ordenar por</h3>
              <select className="w-full bg-transparent border-b border-[#0f2A44]/10 py-2 font-lato text-xs uppercase tracking-widest focus:outline-none focus:border-[#C9A24D]">
                <option>Mais recentes</option>
                <option>Menor Preço</option>
                <option>Maior Preço</option>
              </select>
            </div>
          </div>

          <div className="mt-auto">
             <button 
                onClick={onClose}
                className="w-full bg-[#0f2A44] text-[#F7F7F4] py-4 font-lato text-[10px] uppercase tracking-[0.2em] hover:bg-[#C9A24D] transition-colors"
             >
               Aplicar Filtros
             </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;