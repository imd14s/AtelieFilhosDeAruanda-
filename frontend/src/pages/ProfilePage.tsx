/* eslint-disable */
import React, { useState, ChangeEvent } from 'react';
import { User as UserIcon, Shield, CreditCard, ChevronRight, MapPin, Bell, Gift, Mail, AlertTriangle, X, Loader2, Camera } from 'lucide-react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { getCroppedImg } from '../utils/imageUtils';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { authService } from '../services/authService';
import { User } from '../types';
import { MaskedInput } from '../components/ui/MaskedInput';
import { isValidCPF, isValidCNPJ, sanitizeDocument } from '../utils/fiscal';

interface UserContext {
    user: User | null;
}

type ModalType = 'info' | 'security' | 'cancel' | 'crop' | null;

const ProfilePage: React.FC = () => {
    const { user } = useOutletContext<UserContext>();
    const navigate = useNavigate();

    const [modal, setModal] = useState<ModalType>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [actionMsg, setActionMsg] = useState<string>('');

    // State for Cropping
    const [image, setImage] = useState<string | null>(null);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState<number>(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    // Profile Edit State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        document: user?.document || ''
    });
    const [profileError, setProfileError] = useState('');

    const onCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleAction = async (endpoint: string, payload: Record<string, unknown>, successMsg: string) => {
        setLoading(true);
        setActionMsg('');
        try {
            await api.post(endpoint, payload);
            setActionMsg(successMsg);
            setTimeout(() => { setModal(null); setActionMsg(''); }, 2000);
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { message?: string } } };
            setActionMsg(apiError.response?.data?.message || 'Ocorreu um erro.');
        }
        setLoading(false);
    };

    const handleCancelAccount = async () => {
        if (!user?.id) return;
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

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result as string);
                setModal('crop');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadCrop = async () => {
        if (!image || !croppedAreaPixels || !user) return;
        setLoading(true);
        try {
            const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels);
            if (!croppedImageBlob) throw new Error("Falha ao gerar imagem cortada");

            const file = new File([croppedImageBlob], 'profile-photo.jpg', { type: 'image/jpeg' });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', 'avatars');
            formData.append('public', 'true');

            // 1. Upload da imagem
            const uploadResp = await api.post('/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // 2. A url retornada pode ser o id da mídia. 
            const photoUrl = `${api.defaults.baseURL}/media/public/${uploadResp.data.id}`;

            // 3. Atualizar o perfil do usuário
            await api.patch('/users/profile/photo', { photoUrl });

            // 4. Atualizar localStorage e estado global
            const updatedUser = { ...user, photoUrl };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.dispatchEvent(new Event('auth-changed'));

            setModal(null);
            setTimeout(() => setActionMsg(''), 3000);
        } catch (err: unknown) {
            console.error('Erro ao atualizar foto:', err);
            const apiError = err as { response?: { data?: { error?: string, message?: string } } };
            const detail = apiError.response?.data?.error || apiError.response?.data?.message || 'Erro ao atualizar foto.';
            setActionMsg(detail);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setProfileError('');

        try {
            // Validação de documento se preenchido
            if (profileData.document) {
                const cleanDoc = sanitizeDocument(profileData.document);
                const isDocValid = cleanDoc.length === 11 ? isValidCPF(cleanDoc) : (cleanDoc.length === 14 ? isValidCNPJ(cleanDoc) : false);

                if (!isDocValid) {
                    setProfileError("Por favor, insira um CPF ou CNPJ válido.");
                    setLoading(false);
                    return;
                }
                profileData.document = cleanDoc;
            }

            await authService.updateProfile(profileData);
            setActionMsg('Perfil atualizado com sucesso!');
            setModal(null);
            setTimeout(() => setActionMsg(''), 3000);
        } catch (err: unknown) {
            const apiError = err as { response?: { data?: { message?: string } } };
            setProfileError(apiError.response?.data?.message || 'Erro ao atualizar perfil.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="w-full pb-12 font-lato relative">
            <div className="max-w-4xl mx-auto px-4 pt-8">
                {/* Header Profile */}
                <div className="flex items-center gap-6 mb-10">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-[var(--azul-profundo)] text-[var(--dourado-suave)] flex items-center justify-center text-3xl font-bold font-playfair shadow-lg overflow-hidden border-2 border-[var(--dourado-suave)]">
                            {user.photoUrl ? (
                                <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span>{user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}</span>
                            )}
                        </div>

                        {/* Botão de Trocar Foto (Oculto se for Google) */}
                        {!user.googleId && (
                            <label
                                htmlFor="photo-upload"
                                className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                                title="Mudar foto de perfil"
                            >
                                <Camera size={16} className="text-[var(--azul-profundo)]" />
                                <input
                                    id="photo-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={onFileChange}
                                    disabled={loading}
                                />
                            </label>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{user.name || 'Visitante'}</h1>
                        <p className="text-gray-500 mt-1 flex items-center gap-2">
                            <Mail size={14} /> {user.email}
                        </p>
                    </div>
                </div>

                {/* Mensagens Globais */}
                {actionMsg && !modal && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm flex items-center gap-2">
                        <Bell size={16} />
                        {actionMsg}
                    </div>
                )}

                {/* Banner de Verificação (Apenas para não verificados) */}
                {user.emailVerified === false && (
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
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!user.googleId && (
                        <button onClick={() => {
                            setProfileData({ name: user.name || '', document: user.document || '' });
                            setModal('info');
                        }} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow group text-left">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    <UserIcon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">Dados Pessoais</h3>
                                    <p className="text-sm text-gray-500 mt-1">Nome e Identificação Fiscal</p>
                                </div>
                            </div>
                            <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </button>
                    )}

                    {!user.googleId && (
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
                    )}

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
                    <div className={`${modal === 'crop' ? 'max-w-xl' : 'max-w-md'} bg-white w-full rounded shadow-2xl p-6 relative`}>
                        <button onClick={() => { setModal(null); setActionMsg(''); }} className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-800 bg-white rounded-full p-1" aria-label="Close">
                            <X size={20} />
                        </button>

                        {modal === 'info' && (
                            <div>
                                <h2 className="text-xl font-bold mb-4 text-gray-800">Dados Pessoais</h2>
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            className="w-full border border-gray-200 rounded px-4 py-2 focus:border-[var(--azul-profundo)] outline-none"
                                            required
                                        />
                                    </div>
                                    <MaskedInput
                                        id="profile-document"
                                        mask="cpf-cnpj"
                                        label="CPF ou CNPJ"
                                        value={profileData.document}
                                        onChange={(val) => setProfileData({ ...profileData, document: val })}
                                    />
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
                                        Necessário para a emissão de Notas Fiscais Eletrônicas.
                                    </p>

                                    {profileError && <p className="text-xs text-red-500 font-bold">{profileError}</p>}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[var(--azul-profundo)] text-white py-2 rounded font-bold hover:bg-[#0a1e33] flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Salvar Alterações'}
                                    </button>
                                </form>
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 mb-3 text-center italic">Para outras alterações críticas, contate o suporte.</p>
                                    <a href="https://wa.me/5511963212172" target="_blank" rel="noreferrer" className="block w-full text-center border border-gray-200 text-gray-600 py-2 rounded font-bold hover:bg-gray-50 text-sm">Falar no WhatsApp</a>
                                </div>
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

                        {modal === 'crop' && image && (
                            <div className="flex flex-col">
                                <h2 className="text-xl font-bold mb-4 text-gray-800">Ajustar Foto</h2>
                                <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden mb-4">
                                    <Cropper
                                        image={image}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={1}
                                        onCropChange={setCrop}
                                        onCropComplete={onCropComplete}
                                        onZoomChange={setZoom}
                                    />
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <label htmlFor="zoom-range" className="text-sm text-gray-500">Zoom</label>
                                        <input
                                            id="zoom-range"
                                            type="range"
                                            value={zoom}
                                            min={1}
                                            max={3}
                                            step={0.1}
                                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                                            className="grow accent-[var(--azul-profundo)]"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setModal(null)}
                                            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded font-bold hover:bg-gray-50"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleUploadCrop}
                                            disabled={loading}
                                            className="flex-1 bg-[var(--azul-profundo)] text-white py-2 rounded font-bold hover:bg-[#0a1e33] flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Salvar Foto'}
                                        </button>
                                    </div>
                                    {actionMsg && <p className="text-sm font-bold text-red-600 text-center">{actionMsg}</p>}
                                </div>
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
