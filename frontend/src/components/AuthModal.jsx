import React, { useState } from "react";
import { X, Mail, Lock, User, Key, Loader2 } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { authService } from "../services/authService";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// Componente separado para usar o hook useGoogleLogin com segurança.
// O hook SÓ pode ser chamado quando o GoogleOAuthProvider está montado na árvore.
const GoogleLoginButton = ({ onSuccess, onError, disabled }) => {
  const googleLogin = useGoogleLogin({
    onSuccess,
    onError,
  });

  return (
    <button
      type="button"
      onClick={() => googleLogin()}
      disabled={disabled}
      className="w-full bg-white border border-gray-300 text-gray-700 py-3 font-lato text-xs uppercase tracking-[0.1em] hover:bg-gray-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      Entrar com Google
    </button>
  );
};

// Botão fallback quando o Google Client ID não está configurado
const GoogleLoginButtonDisabled = () => (
  <button
    type="button"
    disabled
    title="Configure VITE_GOOGLE_CLIENT_ID no .env para ativar"
    className="w-full bg-white border border-gray-200 text-gray-400 py-3 font-lato text-xs uppercase tracking-[0.1em] flex items-center justify-center gap-3 cursor-not-allowed opacity-50"
  >
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#9CA3AF" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#9CA3AF" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#9CA3AF" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#9CA3AF" />
    </svg>
    Google (não configurado)
  </button>
);

const AuthModal = ({ isOpen, onClose }) => {
  const [view, setView] = useState("LOGIN"); // LOGIN, REGISTER, VERIFY
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Early return APÓS todos os hooks (nenhum hook abaixo daqui)
  if (!isOpen) return null;

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const userInfo = await res.json();
      await authService.googleLoginWithUserInfo(userInfo, tokenResponse.access_token);
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("[Google Login] Erro:", err);
      setError("Falha ao entrar com Google. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (err) => {
    console.error("[Google Login] Erro OAuth:", err);
    setError("Falha ao autenticar com Google. Tente novamente.");
  };

  const resetState = () => {
    setView("LOGIN");
    setEmail("");
    setPassword("");
    setName("");
    setCode("");
    setError("");
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authService.login(email, password);
      handleClose();
      window.location.reload();
    } catch (err) {
      setError("Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authService.register({ name, email, password });
      setView("VERIFY");
    } catch (err) {
      setError("Erro ao cadastrar. Tente outro e-mail.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authService.verify(email, code);
      window.dispatchEvent(new CustomEvent('show-alert', { detail: "Conta verificada! Faça login para continuar." }));
      setView("LOGIN");
    } catch (err) {
      setError("Código inválido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0f2A44]/60 backdrop-blur-sm">
      <div className="bg-[#F7F7F4] w-full max-w-md overflow-hidden relative shadow-2xl rounded-sm">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[#0f2A44]/40 hover:text-[#0f2A44] transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="font-playfair text-3xl text-[#0f2A44] mb-2">
              {view === "LOGIN" && "Bem-vindo"}
              {view === "REGISTER" && "Criar Conta"}
              {view === "VERIFY" && "Verificação"}
            </h2>
            <p className="font-lato text-[10px] uppercase tracking-[0.2em] text-[#C9A24D]">
              {view === "LOGIN" && "Entre na sua conta para continuar"}
              {view === "REGISTER" && "Cadastre-se para aproveitar ofertas"}
              {view === "VERIFY" && `Código enviado para ${email}`}
            </p>
          </div>

          {/* VIEW: LOGIN */}
          {view === "LOGIN" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0f2A44]/30" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-[#0f2A44]/10 py-3 pl-10 pr-4 text-sm focus:border-[#C9A24D] outline-none transition-colors"
                    placeholder="E-mail"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0f2A44]/30" size={16} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-[#0f2A44]/10 py-3 pl-10 pr-4 text-sm focus:border-[#C9A24D] outline-none transition-colors"
                    placeholder="Senha"
                  />
                </div>
              </div>

              {error && <p className="text-red-600 text-[11px] font-lato italic">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0f2A44] text-white py-4 font-lato text-xs uppercase tracking-[0.2em] hover:bg-[#C9A24D] transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Entrar"}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs">OU</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Botão Google — renderiza o componente correto baseado na configuração */}
              {GOOGLE_CLIENT_ID ? (
                <GoogleLoginButton
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  disabled={loading}
                />
              ) : (
                <GoogleLoginButtonDisabled />
              )}

              <div className="mt-4 text-center">
                <p className="font-lato text-[11px] text-[#0f2A44]/40">
                  Ainda não tem conta?{" "}
                  <span onClick={() => setView("REGISTER")} className="text-[#C9A24D] cursor-pointer hover:underline">
                    Cadastre-se
                  </span>
                </p>
              </div>
            </form>
          )}

          {/* VIEW: REGISTER */}
          {view === "REGISTER" && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0f2A44]/30" size={16} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border border-[#0f2A44]/10 py-3 pl-10 pr-4 text-sm focus:border-[#C9A24D] outline-none transition-colors"
                    placeholder="Nome Completo"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0f2A44]/30" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-[#0f2A44]/10 py-3 pl-10 pr-4 text-sm focus:border-[#C9A24D] outline-none transition-colors"
                    placeholder="E-mail"
                  />
                </div>
              </div>
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0f2A44]/30" size={16} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-[#0f2A44]/10 py-3 pl-10 pr-4 text-sm focus:border-[#C9A24D] outline-none transition-colors"
                    placeholder="Senha"
                  />
                </div>
              </div>

              {error && <p className="text-red-600 text-[11px] font-lato italic">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0f2A44] text-white py-4 font-lato text-xs uppercase tracking-[0.2em] hover:bg-[#C9A24D] transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Criar Conta"}
              </button>

              <div className="mt-4 text-center">
                <p className="font-lato text-[11px] text-[#0f2A44]/40">
                  Já tem conta?{" "}
                  <span onClick={() => setView("LOGIN")} className="text-[#C9A24D] cursor-pointer hover:underline">
                    Fazer Login
                  </span>
                </p>
              </div>
            </form>
          )}

          {/* VIEW: VERIFY */}
          {view === "VERIFY" && (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600 mb-2">Digite o código de 6 dígitos:</p>
              </div>
              <div>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0f2A44]/30" size={16} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-white border border-[#0f2A44]/10 py-3 pl-10 pr-4 text-sm focus:border-[#C9A24D] outline-none transition-colors tracking-widest text-center text-lg"
                    placeholder="000000"
                  />
                </div>
              </div>

              {error && <p className="text-red-600 text-[11px] font-lato italic">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0f2A44] text-white py-4 font-lato text-xs uppercase tracking-[0.2em] hover:bg-[#C9A24D] transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Verificar E-mail"}
              </button>
              <div className="mt-4 text-center">
                <p
                  className="font-lato text-[11px] text-[#0f2A44]/40 cursor-pointer hover:underline"
                  onClick={() => setView("REGISTER")}
                >
                  Voltar
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
