import React, { useState } from 'react';
import { X, Mail, Lock, Chrome, Facebook, Loader2 } from 'lucide-react';
import { loginWithEmail, wixClient } from '../utils/wixClient';

const AuthModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // mantido apenas visual
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

const handleSocialLogin = async (provider) => {
  try {
    setLoading(true);

    const redirectUri = `${window.location.origin}/auth/callback`;

    // 🔵 Fluxo oficial Wix
    const oauthData = wixClient.auth.generateOAuthData(redirectUri);

    localStorage.setItem('wix_oauth_data', JSON.stringify(oauthData));

    const { authUrl } = await wixClient.auth.getAuthUrl(oauthData, {
      authProvider: provider, // 'google' | 'facebook'
    });

    if (!authUrl) {
      throw new Error('URL de autenticação não gerada');
    }

    window.location.href = authUrl;
  } catch (error) {
    console.error('Erro no login social:', error);
    alert('Erro ao iniciar login social.');
  } finally {
    setLoading(false);
  }
};


  // LOGIN POR E-MAIL (PASSWORDLESS)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginWithEmail(email);
      alert('Enviamos um link de acesso para seu e-mail.');
      onClose();
    } catch (error) {
      console.error(error);
      alert('Erro ao enviar link de acesso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-[#0f2A44]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#F7F7F4] w-full max-w-md overflow-hidden shadow-2xl animate-slide-up">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
          style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/p6.png')` }}
        />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#0f2A44]/50 hover:text-[#0f2A44] transition-colors z-[210]"
        >
          <X size={24} />
        </button>

        <div className="p-8 md:p-10 relative z-10">
          <div className="text-center mb-8">
            <h2 className="font-playfair text-3xl text-[#0f2A44]">Bem-vindo ao Ateliê</h2>
            <p className="font-lato text-xs uppercase tracking-[0.2em] text-[#C9A24D] mt-2">
              Identifique-se para continuar
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-[#0f2A44]/10 bg-white py-3 px-4 font-lato text-xs uppercase tracking-widest text-[#0f2A44] hover:bg-[#0f2A44] hover:text-white transition-all duration-500 disabled:opacity-50"
            >
              <Chrome size={18} /> Continuar com Google
            </button>

            <button
              onClick={() => handleSocialLogin('facebook')}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-[#0f2A44]/10 bg-white py-3 px-4 font-lato text-xs uppercase tracking-widest text-[#0f2A44] hover:bg-[#1877F2] hover:text-white transition-all duration-500 disabled:opacity-50"
            >
              <Facebook size={18} /> Continuar com Facebook
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-8">
            <div className="border-t border-[#0f2A44]/10 w-full"></div>
            <span className="bg-[#F7F7F4] px-4 font-lato text-[10px] uppercase text-[#0f2A44]/40 absolute italic">
              ou use seu e-mail
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0f2A44]/30" size={18} />
              <input
                type="email"
                placeholder="SEU E-MAIL"
                className="w-full bg-white border border-[#0f2A44]/10 py-3 pl-10 pr-4 font-lato text-[11px] focus:outline-none focus:border-[#C9A24D] placeholder:text-[#0f2A44]/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Campo de senha mantido apenas visualmente */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0f2A44]/30" size={18} />
              <input
                type="password"
                placeholder="SUA SENHA"
                className="w-full bg-white border border-[#0f2A44]/10 py-3 pl-10 pr-4 font-lato text-[11px] opacity-50 cursor-not-allowed"
                disabled
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f2A44] text-[#F7F7F4] py-4 font-lato text-xs uppercase tracking-[0.3em] hover:bg-[#C9A24D] transition-all duration-500 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Conectando...
                </>
              ) : (
                'Entrar no Ateliê'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
