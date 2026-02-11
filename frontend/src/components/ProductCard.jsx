import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { storeService } from '../services/storeService'; // Nova importação
import { ShoppingBag, Check, Loader2 } from 'lucide-react';

const ProductCard = ({ product }) => {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simula um delay pequeno para feedback visual
    setTimeout(() => {
      storeService.cart.add(product, 1);
      setAdded(true);
      setLoading(false);

      setTimeout(() => setAdded(false), 2000);
    }, 300);
  };

  // Formatação de preço (agora direta, sem estrutura aninhada do Wix)
  const priceFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(product.price || 0);

  const isOutOfStock = product.stockQuantity <= 0;
  const imageUrl = product.images?.[0] || '/images/default.png';

  return (
    <div className="group relative flex flex-col bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 rounded-sm">
      <Link to={`/produto/${product.id}`} className="relative aspect-[4/5] overflow-hidden bg-[#f0f0f0]">
        <img
          src={imageUrl}
          alt={product.name}
          onError={(e) => { e.target.src = '/images/default.png'; }}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-[var(--azul-profundo)] text-white text-[10px] px-3 py-1 uppercase tracking-widest">Esgotado</span>
          </div>
        )}
      </Link>

      <div className="flex flex-col flex-1 p-4 text-center">
        <p className="font-lato text-[9px] uppercase tracking-[0.2em] text-[var(--dourado-suave)] mb-1">
          Ateliê Aruanda
        </p>

        <Link to={`/produto/${product.id}`}>
          <h3 className="font-playfair text-lg text-[var(--azul-profundo)] mb-2 line-clamp-2 group-hover:text-[var(--dourado-suave)] transition-colors min-h-[3.5rem]">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto">
          <p className="font-lato text-sm font-bold text-[var(--azul-profundo)] mb-4">
            {priceFormatted}
          </p>

          <a
            href={product.tiktokUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 font-lato text-[11px] uppercase tracking-[0.2em] transition-all duration-300 rounded-sm bg-black text-white hover:bg-[#FE2C55] shadow-sm hover:shadow-md"
          >
            <ShoppingBag size={16} /> Ver na TikTok Shop
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
