import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { storeService } from '../services/storeService';

const CartDrawer = ({ isOpen, onClose, cartItems, onUpdateCart }) => {
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const removeItem = (id) => {
    storeService.cart.remove(id);
    onUpdateCart(storeService.cart.get());
  };

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return;
    const cart = storeService.cart.get();
    const item = cart.items.find(i => i.id === id);
    if (item) {
      item.quantity = newQty;
      localStorage.setItem('cart', JSON.stringify(cart));
      onUpdateCart(cart);
      window.dispatchEvent(new Event('cart-updated'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] overflow-hidden">
      <div className="absolute inset-0 bg-[#0f2A44]/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-[#F7F7F4] shadow-2xl flex flex-col">
          <div className="px-6 py-8 border-b border-[#0f2A44]/5 flex items-center justify-between">
            <h2 className="font-playfair text-2xl text-[#0f2A44]">Sua Sacola</h2>
            <button onClick={onClose} className="text-[#0f2A44]/40 hover:text-[#0f2A44]">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <ShoppingBag size={48} className="text-[#0f2A44]/10 mb-4" />
                <p className="font-lato text-sm text-[#0f2A44]/50 uppercase tracking-widest">Sua sacola está vazia</p>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-20 h-24 bg-white flex-shrink-0 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h3 className="font-playfair text-[#0f2A44] text-sm mb-1">{item.name}</h3>
                      <p className="font-lato text-xs text-[#C9A24D] mb-3">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center border border-[#0f2A44]/10 bg-white">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-[#0f2A44]">-</button>
                          <span className="px-2 text-xs font-lato">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-[#0f2A44]">+</button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-[#0f2A44]/30 hover:text-red-800 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="px-6 py-8 bg-white border-t border-[#0f2A44]/5">
              <div className="flex justify-between mb-6">
                <span className="font-lato text-[10px] uppercase tracking-[0.2em] text-[#0f2A44]/60">Subtotal</span>
                <span className="font-lato font-bold text-[#0f2A44]">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
                </span>
              </div>
              <button className="w-full bg-[#0f2A44] text-white py-4 font-lato text-xs uppercase tracking-[0.2em] hover:bg-[#C9A24D] transition-all flex items-center justify-center gap-3 group">
                Finalizar Compra
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
