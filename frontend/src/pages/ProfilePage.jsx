import React, { useState } from 'react';
import { User, Shield, CreditCard, ChevronRight, MapPin, Bell, Lock, Gift, Mail, AlertTriangle, X, Loader2 } from 'lucide-react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import authService from '../services/authService';

const ProfilePage = () => {
    const { user } = useOutletContext();
    const navigate = useNavigate();

    const [modal, setModal] = useState(null); // 'info', 'security', 'privacy', 'communications', 'cancel', null
    const [loading, setLoading] = useState(false);
    const [actionMsg, setActionMsg] = useState('');

    const handleAction = async (endpoint, payload, successMsg) => {
        setLoading(true);
        setActionMsg('');
        try {
            await api.post(endpoint, payload);
            setActionMsg(successMsg);
            setTimeout(() => { setModal(null); setActionMsg(''); }, 2000);
        } catch (err) {
            setActionMsg(err.response?.data?.message || 'Ocorreu um erro.');
        }
        setLoading(false);
    };

    const handleCancelAccount = async () => {
        setLoading(true);
        try {
            await api.delete(`/users/${user.id}`);
            authService.logout();
            navigate('/login');
        } catch (err) {
            setActionMsg('Erro ao cancelar conta. Entre em contato com o suporte.');
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="w-full pb-12 font-lato relative">
            <div className="max-w-4xl mx-auto px-4 pt-8">
                {/* Header Profile */}
                <div className="flex items-center gap-6 mb-10">
                    <div className="w-20 h-20 rounded-full bg-[var(--azul-profundo)] text-[var(--dourado-suave)] flex items-center justify-center text-2xl font-bold font-playfair shadow-md">
                        {user.nome?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{user.nome || 'Visitante'} {user.sobrenome || ''}</h1>
                        <p className="text-gray-500 mt-1 flex items-center gap-2">
                            <Mail size={14} /> {user.email}
                        </p>
                    </div>
                </div>

                {/* Banner de Verificação (Apenas visual, sem lógica deep yet) */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-10 flex items-start gap-4">
                    <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h3 className="text-sm font-bold text-yellow-800">Verifique seu e-mail</h3>
                        <p className="text-sm text-yellow-700 mt-1 mb-3">Para garantir a segurança da sua conta e receber notificações de pedidos, confirme seu endereço de e-mail.</p>
                        <button
                            onClick={() => handleAction('/users/resend-verification', { email: user.email }, 'Link enviado para o e-mail!')}
                            className="bg-yellow-500 text-white px-4 py-2 rounded text-sm font-bold hover:bg-yellow-600 transition-colors"
                        >
                            {loading && modal === null ? <Loader2 size={16} className="animate-spin inline mr-2" /> : 'Validar E-mail'}
                        </button>
                        {actionMsg && modal === null && <span className="ml-3 text-sm text-yellow-800 font-bold">{actionMsg}</span>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={() => setModal('info')} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow group text-left">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <User size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Informações do Perfil</h3>
                                <p className="text-sm text-gray-500 mt-1">Dados pessoais e contato</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </button>

                    <button onClick={() => setModal('security')} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow group text-left">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Segurança</h3>
                                <p className="text-sm text-gray-500 mt-1">Senha e autenticação</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </button>

                    <Link to="/assinaturas" className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow group text-left">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                <Gift size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Assinaturas Ateliê+</h3>
                                <p className="text-sm text-gray-500 mt-1">Gerencie seu plano mensal</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-300 group-hover:text-yellow-500 transition-colors" />
                    </Link>

                    <Link to="/perfil/cartoes" className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow group text-left">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Cartões Salvos</h3>
                                <p className="text-sm text-gray-500 mt-1">Gerencie formas de pagamento</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </Link>

                    <Link to="/perfil/enderecos" className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow group text-left">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Endereços</h3>
                                <p className="text-sm text-gray-500 mt-1">Locais de entrega das compras</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </Link>

                    <button onClick={() => setModal('privacy')} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow group text-left">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <Lock size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Privacidade</h3>
                                <p className="text-sm text-gray-500 mt-1">Controle de uso dos seus dados</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </button>

                    <button onClick={() => setModal('communications')} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow group text-left">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <Bell size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">Comunicações</h3>
                                <p className="text-sm text-gray-500 mt-1">E-mails promocionais e ofertas</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </button>

                </div>

                <div className="mt-12 text-center">
                    <button onClick={() => setModal('cancel')} className="text-sm text-gray-400 hover:text-red-500 transition-colors hover:underline">
                        Deseja cancelar sua conta?
                    </button>
                </div>
            </div>

            {/* Modals Extras */}
            {modal && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded shadow-2xl p-6 relative">
                        <button onClick={() => { setModal(null); setActionMsg(''); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
                            <X size={20} />
                        </button>

                        {modal === 'info' && (
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-gray-800">Informações do Perfil</h2>
                                <p className="text-sm text-gray-600 mb-4">Atualização de dados disponível direto pelo Suporte para garantir a segurança da conta.</p>
                                <a href="https://wa.me/5511963212172" target="_blank" rel="noreferrer" className="block w-full text-center bg-[var(--azul-profundo)] text-white py-2 rounded font-bold hover:bg-[#0a1e33]">Falar com Suporte WhatsApp</a>
                            </div>
                        )}

                        {modal === 'security' && (
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-gray-800">Trocar Senha</h2>
                                <p className="text-sm text-gray-600 mb-4">Você receberá um e-mail com um link seguro para redefinir sua senha.</p>
                                <button
                                    onClick={() => handleAction('/auth/forgot-password', { email: user.email }, 'Link de redefinição enviado!')}
                                    disabled={loading}
                                    className="w-full bg-[var(--azul-profundo)] text-white py-2 rounded font-bold hover:bg-[#0a1e33] disabled:opacity-50"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Solicitar Redefinição'}
                                </button>
                                {actionMsg && <p className="mt-3 text-sm font-bold text-green-600 text-center">{actionMsg}</p>}
                            </div>
                        )}

                        {modal === 'privacy' && (
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-gray-800">Privacidade</h2>
                                <p className="text-sm text-gray-600 mb-4 tracking-wide leading-relaxed">De acordo com a LGPD, seus dados estão seguros. Nós usamos suas informações apenas para processamento de pedidos e emissão de notas fiscais.</p>
                                <button onClick={() => setModal(null)} className="w-full border border-gray-300 text-gray-700 py-2 rounded font-bold hover:bg-gray-50">Entendi</button>
                            </div>
                        )}

                        {modal === 'communications' && (
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-gray-800">Comunicações</h2>
                                <div className="space-y-4 mb-6">
                                    <label className="flex items-center gap-3">
                                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600" />
                                        <span className="text-sm text-gray-700">Receber e-mails do Ateliê</span>
                                    </label>
                                    <label className="flex items-center gap-3">
                                        <input type="checkbox" defaultChecked className="w-4 h-4 accent-blue-600" />
                                        <span className="text-sm text-gray-700">Notificações pelo WhatsApp</span>
                                    </label>
                                </div>
                                <button onClick={() => { setActionMsg('Preferências salvas!'); setTimeout(() => setModal(null), 1000); }} className="w-full bg-[var(--azul-profundo)] text-white py-2 rounded font-bold hover:bg-[#0a1e33]">Salvar Preferências</button>
                                {actionMsg && <p className="mt-3 text-sm font-bold text-green-600 text-center">{actionMsg}</p>}
                            </div>
                        )}

                        {modal === 'cancel' && (
                            <div>
                                <h2 className="text-xl font-bold mb-2 text-red-600">Alerta de Exclusão</h2>
                                <p className="text-sm text-gray-600 mb-6">Tem certeza que deseja cancelar sua conta? <b>Esta ação não pode ser desfeita</b> e todo o seu histórico será permanentemente apagado.</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setModal(null)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded font-bold hover:bg-gray-50">Voltar</button>
                                    <button onClick={handleCancelAccount} disabled={loading} className="flex-1 bg-red-600 text-white py-2 rounded font-bold hover:bg-red-700 disabled:opacity-50">
                                        {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Confirmar Exclusão'}
                                    </button>
                                </div>
                                {actionMsg && <p className="mt-3 text-sm font-bold text-red-600 text-center">{actionMsg}</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
