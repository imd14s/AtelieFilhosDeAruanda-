import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { wixClient } from '../utils/wixClient';
import { ShoppingBag, Check, Loader2 } from 'lucide-react';
import {getWixTokens} from '../utils/wixClient'

const ProductCard = ({ product }) => {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  
  const handleAddToCart = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Usamos os tokens que você acabou de gerar
      const tokens = JSON.parse(localStorage.getItem('wix_tokens') || '{}');
      wixClient.auth.setTokens(tokens);

    // A estrutura correta para o módulo @wix/ecom
    const result = await wixClient.cart.addToCart(product._id,
      {
      lineItems: [
        {
          catalogReference: {
            appId: '1380b703-ce81-ff05-f115-39571d94dfcd', // ID fixo do Wix Stores
            catalogItemId: product._id,
          },
          quantity: 1,
        },
      ],
    });

    setAdded(true);
    
    // Dispara o evento para o Header atualizar o contador
    window.dispatchEvent(new Event('cartUpdated'));
    setTimeout(() => setAdded(false), 2000);
    
  } catch (error) {
    console.error("Erro ao adicionar ao carrinho:", error);
  
  // Em vez de dar reload e causar loop, vamos apenas tentar re-sincronizar os tokens silenciosamente
  const freshTokens = await getWixTokens();
  if (freshTokens) {
    alert("Houve uma oscilação na conexão. Por favor, tente clicar em comprar novamente.");
  }
  } finally {
    setLoading(false);
  }
};

  // Preço formatado
  const price = product.priceData?.formatted?.price || "Consultar";

  return (
    <div className="group relative flex flex-col bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-500">
      {/* Imagem do Produto */}
      <Link to={`/produto/${product.slug}`} className="relative aspect-[4/5] overflow-hidden bg-[#f0f0f0]">
        <img
          src={product.media?.mainMedia?.image?.url || 'https://via.placeholder.com/500'}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Badge de Promoção (Opcional) */}
        {product.discount?.value > 0 && (
          <span className="absolute top-4 left-4 bg-[#C9A24D] text-white text-[10px] font-lato uppercase tracking-widest px-2 py-1">
            Oferta
          </span>
        )}
      </Link>

      {/* Info do Produto */}
      <div className="flex flex-col flex-1 p-5 text-center">
        <p className="font-lato text-[9px] uppercase tracking-[0.2em] text-[#C9A24D] mb-1">
          {product.brand || 'Ateliê Aruanda'}
        </p>
        
        <Link to={`/produto/${product.slug}`}>
          <h3 className="font-playfair text-lg text-[#0f2A44] mb-2 line-clamp-1 group-hover:text-[#C9A24D] transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto">
          <p className="font-lato text-sm font-bold text-[#0f2A44] mb-4">
            {price}
          </p>

          <button
            onClick={handleAddToCart}
            disabled={loading || !product.stock?.inStock}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 font-lato text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${
              !product.stock?.inStock 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : added 
                ? 'bg-green-600 text-white' 
                : 'bg-[#0f2A44] text-white hover:bg-[#C9A24D]'
            }`}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : added ? (
              <><Check size={14} /> Adicionado</>
            ) : !product.stock?.inStock ? (
              'Esgotado'
            ) : (
              <><ShoppingBag size={14} /> Comprar</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;