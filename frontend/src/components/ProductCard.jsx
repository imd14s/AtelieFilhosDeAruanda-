import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { wixClient } from '../utils/wixClient';
import { ShoppingBag, Check, Loader2 } from 'lucide-react';

const ProductCard = ({ product }) => {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  
  const handleAddToCart = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Usamos o adaptador para adicionar ao carrinho local
      await wixClient.cart.addToCart(product._id, 1);
      
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error("Erro ao adicionar:", error);
      alert("Erro ao adicionar produto.");
    } finally {
      setLoading(false);
    }
  };

  const price = product.price?.formatted?.price || 
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price?.amount || 0);

  const isOutOfStock = !product.stock?.inStock;

  return (
    <div className="group relative flex flex-col bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 rounded-sm">
      {/* Imagem */}
      <Link to={`/produto/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-[#f0f0f0]">
        <img
          src={product.media?.mainMedia?.image?.url || 'https://via.placeholder.com/500'}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />
        {isOutOfStock && (
           <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
             <span className="bg-[#0f2A44] text-white text-[10px] px-3 py-1 uppercase tracking-widest">Esgotado</span>
           </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 text-center">
        <p className="font-lato text-[9px] uppercase tracking-[0.2em] text-[#C9A24D] mb-1">
           Ateliê Aruanda
        </p>
        
        <Link to={`/produto/${product.slug}`}>
          <h3 className="font-playfair text-lg text-[#0f2A44] mb-2 line-clamp-2 group-hover:text-[#C9A24D] transition-colors h-14 flex items-center justify-center">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto">
          <p className="font-lato text-sm font-bold text-[#0f2A44] mb-4">
            {price}
          </p>

          <button
            onClick={handleAddToCart}
            disabled={loading || isOutOfStock}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 font-lato text-[11px] uppercase tracking-[0.2em] transition-all duration-300 rounded-sm ${
              isOutOfStock 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : added 
                ? 'bg-green-700 text-white' 
                : 'bg-[#0f2A44] text-white hover:bg-[#C9A24D]'
            }`}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : added ? (
              <><Check size={16} /> Na Sacola</>
            ) : isOutOfStock ? (
              'Indisponível'
            ) : (
              <><ShoppingBag size={16} /> Comprar</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
