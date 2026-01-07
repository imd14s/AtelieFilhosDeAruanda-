import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { getWixImageUrl } from '../utils/mediaUtils';
import { wixClient } from '../utils/wixClient';

const CartDrawer = ({ isOpen, onClose, cartItems = [], onUpdateCart }) => {
  const [loadingItemId, setLoadingItemId] = useState(null);

  // O Wix armazena o subtotal no objeto do carrinho, mas se não vier, calculamos:
  const subtotal = cartItems.reduce((acc, item) => {
    const price = Number(item.price?.amount || item.price || 0);
    return acc + (price * (item.quantity || 1));
  }, 0);

  // Função para remover item do carrinho do Wix
  const handleRemoveItem = async (itemId) => {
    setLoadingItemId(itemId);
    try {
      // O Wix usa removeLineItemsFromCurrentCart
      const updatedCart = await wixClient.currentCart.removeLineItemsFromCurrentCart([itemId]);
      onUpdateCart(updatedCart); // Função para atualizar o estado global do carrinho
    } catch (error) {
      console.error("Erro ao remover item:", error);
    } finally {
      setLoadingItemId(null);
    }
  };

  // Função para atualizar quantidade
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setLoadingItemId(itemId);
    try {
      const updatedCart = await wixClient.currentCart.updateLineItemsQuantityInCurrentCart([
        { _id: itemId, quantity: newQuantity }
      ]);
      onUpdateCart(updatedCart);
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error);
    } finally {
      setLoadingItemId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full w-full md:w-[450px] animate-slide-left">
        <div className="flex h-full w-full flex-col bg-[#F7F7F4] shadow-2xl border-l border-[#0f2A44]/10">
          
          <div className="flex items-center justify-between px-6 py-6 border-b border-[#0f2A44]/10">
            <div>
              <h2 className="font-playfair text-2xl text-[#0f2A44]">Seu Carrinho</h2>
              <p className="font-lato text-[10px] uppercase tracking-[0.1em] text-[#C9A24D]">Ateliê Filhos de Aruanda</p>
            </div>
            <button onClick={onClose} className="text-[#0f2A44] hover:text-[#C9A24D] transition-all">
              <X size={28} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
            {cartItems.length > 0 ? (
              <ul className="space-y-6">
                {cartItems.map((item) => {
                  // Mapeamento correto das propriedades do Wix lineItem
                  const imageUrl = item.image || item.media;
                  const itemPrice = item.price?.amount || item.price || 0;

                  return (
                    <li key={item._id} className="flex items-center gap-4 group relative">
                      {loadingItemId === item._id && (
                        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                          <Loader2 className="animate-spin text-[#0f2A44]" size={20} />
                        </div>
                      )}
                      
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-sm border border-[#0f2A44]/5">
                        <img 
                          src={getWixImageUrl(imageUrl, 200, 200)} 
                          alt={item.productName?.original} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between font-playfair text-[#0f2A44]">
                          <h3 className="text-lg leading-tight line-clamp-1">{item.productName?.translated || item.productName?.original}</h3>
                          <p className="font-lato font-semibold text-sm">R$ {Number(itemPrice).toFixed(2)}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-[#0f2A44]/20 rounded-sm">
                            <button 
                              onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                              className="px-2 py-1 text-[#0f2A44] hover:bg-[#0f2A44]/5"
                            >-</button>
                            <span className="px-3 py-1 font-lato text-xs border-x border-[#0f2A44]/20">{item.quantity}</span>
                            <button 
                              onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                              className="px-2 py-1 text-[#0f2A44] hover:bg-[#0f2A44]/5"
                            >+</button>
                          </div>
                          <button 
                            onClick={() => handleRemoveItem(item._id)}
                            className="text-red-800/50 hover:text-red-800 transition-colors flex items-center gap-1 group/del"
                          >
                            <Trash2 size={16} />
                            <span className="text-[10px] uppercase font-lato opacity-0 group-hover/del:opacity-100 transition-opacity">Remover</span>
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#0f2A44]/30">
                <ShoppingBag size={64} strokeWidth={1} />
                <p className="mt-4 font-lato text-xs uppercase tracking-[0.2em]">Seu axé está vazio</p>
              </div>
            )}
          </div>

          <div className="border-t border-[#0f2A44]/10 px-6 py-8 bg-white/40">
            <div className="flex justify-between text-xl font-playfair text-[#0f2A44] mb-2">
              <span>Subtotal</span>
              <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
            </div>
            
            <button 
              className="w-full bg-[#0f2A44] text-[#F7F7F4] font-lato py-4 uppercase tracking-[0.2em] text-xs hover:bg-[#C9A24D] transition-all duration-500 shadow-xl"
              onClick={() => {
                // Aqui você pode redirecionar para a URL de checkout do Wix
                alert("Redirecionando para o checkout seguro...");
              }}
            >
              Finalizar Compra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;