import React, { useState } from "react";
import { X, Mail, Lock, Loader2 } from "lucide-react";
import { storeService } from "../services/storeService";

const AuthModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await storeService.auth.login(email, password);
      onClose();
      window.location.reload(); // Atualiza para refletir o estado de logado
    } catch (err) {
      setError("E-mail ou senha inválidos. Tente novamente.");
      console.error("Erro no login:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0f2A44]/60 backdrop-blur-sm">
      <div className="bg-[#F7F7F4] w-full max-w-md overflow-hidden relative shadow-2xl rounded-sm">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#0f2A44]/40 hover:text-[#0f2A44] transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="font-playfair text-3xl text-[#0f2A44] mb-2">Bem-vindo</h2>
            <p className="font-lato text-[10px] uppercase tracking-[0.2em] text-[#C9A24D]">
              Entre na sua conta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-lato text-[10px] uppercase tracking-widest text-[#0f2A44]/60 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0f2A44]/30" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#0f2A44]/10 py-3 pl-10 pr-4 text-sm focus:border-[#C9A24D] outline-none transition-colors"
                  placeholder="exemplo@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block font-lato text-[10px] uppercase tracking-widest text-[#0f2A44]/60 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0f2A44]/30" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-[#0f2A44]/10 py-3 pl-10 pr-4 text-sm focus:border-[#C9A24D] outline-none transition-colors"
                  placeholder="********"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-[11px] font-lato italic">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f2A44] text-white py-4 font-lato text-xs uppercase tracking-[0.2em] hover:bg-[#C9A24D] transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Entrar no Ateliê"}
            </button>
          </form>

          <div className="mt-8 text-center">
             <p className="font-lato text-[11px] text-[#0f2A44]/40">
               Ainda não tem conta? <span className="text-[#C9A24D] cursor-pointer hover:underline">Cadastre-se</span>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
