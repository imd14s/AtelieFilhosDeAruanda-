import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';

const PasswordResetPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [message, setMessage] = useState<string>('');

    useEffect(() => {
        if (!token) {
            setStatus('ERROR');
            setMessage('Token de recuperação inválido ou ausente.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        if (password !== confirmPassword) {
            setMessage('As senhas não coincidem.');
            return;
        }

        setLoading(true);
        setStatus('IDLE');
        setMessage('');

        try {
            await authService.resetPassword(token, password);
            setStatus('SUCCESS');
            setMessage('Sua senha foi redefinida com sucesso!');
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('open-auth-modal'));
                navigate('/');
            }, 3000);
        } catch (err: any) {
            setStatus('ERROR');
            setMessage(err.response?.data?.message || 'Erro ao redefinir senha. O link pode ter expirado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4 bg-[var(--branco-off-white)]">
            <div className="bg-white p-8 md:p-12 max-w-md w-full shadow-lg border border-[var(--azul-profundo)]/5 rounded-sm">
                <div className="text-center mb-10">
                    <h1 className="font-playfair text-3xl text-[var(--azul-profundo)] mb-3">Redefinir Senha</h1>
                    <p className="font-lato text-[11px] uppercase tracking-[0.2em] text-[var(--dourado-suave)]">
                        Crie uma nova credencial para sua conta
                    </p>
                </div>

                {status === 'SUCCESS' ? (
                    <div className="text-center space-y-4">
                        <div className="flex justify-center">
                            <CheckCircle className="text-green-500 w-16 h-16" />
                        </div>
                        <p className="text-gray-700 font-lato">{message}</p>
                        <p className="text-[10px] text-gray-400">Você será redirecionado para o início em instantes...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-lato">Nova Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 py-4 pl-10 pr-4 text-sm focus:border-[var(--dourado-suave)] outline-none transition-colors"
                                    placeholder="********"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-lato">Confirmar Nova Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 py-4 pl-10 pr-4 text-sm focus:border-[var(--dourado-suave)] outline-none transition-colors"
                                    placeholder="********"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {status === 'ERROR' && (
                            <div className="flex items-start gap-2 text-red-600 bg-red-50 p-4 border border-red-100 italic text-xs font-lato">
                                <AlertCircle size={16} className="shrink-0" />
                                <p>{message}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || (status === 'ERROR' && !token)}
                            className="w-full bg-[var(--azul-profundo)] text-white py-5 font-lato text-xs uppercase tracking-[0.2em] hover:bg-[var(--dourado-suave)] transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : "Alterar Senha"}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="w-full flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest hover:text-[var(--azul-profundo)] transition-colors"
                        >
                            <ArrowLeft size={14} /> Voltar para o início
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PasswordResetPage;
