import { useState, useEffect } from 'react';
import { PenTool, Save, Trash2, Eye, Plus, CheckCircle, Info, Upload, RefreshCcw } from 'lucide-react';
import { api } from '../../api/axios';
import { MediaService } from '../../services/MediaService';

interface Signature {
    id?: string;
    name: string;
    ownerName: string;
    role: string;
    storeName: string;
    whatsapp: string;
    email: string;
    storeUrl: string;
    logoUrl: string;
    motto: string;
}

export function SignaturesPage() {
    const [signatures, setSignatures] = useState<Signature[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [formData, setFormData] = useState<Signature>({
        name: 'Assinatura Principal',
        ownerName: '',
        role: 'Direção',
        storeName: 'Ateliê Filhos de Aruanda',
        whatsapp: '',
        email: '',
        storeUrl: 'https://www.atelie.com.br',
        logoUrl: 'https://via.placeholder.com/150',
        motto: 'Arte e Espiritualidade guiando nossos caminhos.'
    });

    useEffect(() => {
        loadSignatures();
    }, []);

    const loadSignatures = async () => {
        try {
            const { data } = await api.get('/marketing/signatures');
            setSignatures(data);
            if (data.length > 0 && !selectedId) {
                handleSelect(data[0]);
            }
        } catch (error) {
            console.error('Erro ao carregar assinaturas', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelect = (sig: Signature) => {
        setSelectedId(sig.id || null);
        setFormData(sig);
    };

    const handleNew = () => {
        setSelectedId(null);
        setFormData({
            name: 'Nova Assinatura',
            ownerName: '',
            role: '',
            storeName: 'Ateliê Filhos de Aruanda',
            whatsapp: '',
            email: '',
            storeUrl: 'https://www.atelie.com.br',
            logoUrl: 'https://via.placeholder.com/150',
            motto: ''
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.post('/marketing/signatures', formData);
            alert('Assinatura salva com sucesso!');
            loadSignatures();
        } catch (error) {
            console.error('Erro ao salvar assinatura', error);
            alert('Erro ao salvar. Verifique os campos.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente excluir esta assinatura?')) return;
        try {
            await api.delete(`/marketing/signatures/${id}`);
            loadSignatures();
            handleNew();
        } catch (error) {
            console.error('Erro ao excluir', error);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploading(true);
            setUploadProgress(0);
            try {
                const response = await MediaService.upload(file, (progress) => {
                    setUploadProgress(progress);
                });
                setFormData(prev => ({ ...prev, logoUrl: response.url }));
            } catch (err) {
                console.error("Upload failed", err);
                alert("Erro ao fazer upload do logo.");
            } finally {
                setIsUploading(false);
                setUploadProgress(0);
            }
        }
    };

    const renderPreview = () => {
        const storeUrlLabel = formData.storeUrl.replace(/https?:\/\//, '').replace('www.', '');
        return (
            <div className="bg-white border p-8 rounded-xl shadow-inner min-h-[200px] flex items-center justify-center">
                <table cellPadding="0" cellSpacing="0" border={0} style={{ fontFamily: 'Arial, sans-serif', color: '#1B2B42', width: '100%', maxWidth: '500px' }}>
                    <tbody>
                        <tr>
                            <td width="130" style={{ paddingRight: '20px', borderRight: '2px solid #D4AF37' }}>
                                <img src={getImageUrl(formData.logoUrl)} alt="Logo" width="110" style={{ display: 'block', borderRadius: '50%', border: '1px solid #EBEBEB' }} />
                            </td>
                            <td style={{ paddingLeft: '20px' }}>
                                <h2 style={{ margin: '0 0 4px 0', color: '#1B2B42', fontSize: '20px', fontWeight: 'bold' }}>{formData.ownerName || '[Seu Nome]'}</h2>
                                <p style={{ margin: '0 0 12px 0', color: '#555555', fontSize: '14px' }}>
                                    {formData.role} | <strong style={{ color: '#1B2B42' }}>{formData.storeName}</strong>
                                </p>
                                <p style={{ margin: '0', fontSize: '13px', lineHeight: '1.6', color: '#333333' }}>
                                    <span style={{ color: '#D4AF37' }}>✦</span> <strong>WhatsApp:</strong> {formData.whatsapp || '(00) 00000-0000'}<br />
                                    <span style={{ color: '#D4AF37' }}>✦</span> <strong>E-mail:</strong> <span style={{ color: '#1B2B42' }}>{formData.email || 'contato@empresa.com'}</span><br />
                                    <span style={{ color: '#D4AF37' }}>✦</span> <strong>Loja:</strong> <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>{storeUrlLabel || 'www.loja.com.br'}</span>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2} style={{ paddingTop: '15px' }}>
                                <p style={{ margin: '0', fontSize: '12px', color: '#777777', fontStyle: 'italic', borderTop: '1px solid #EEEEEE', paddingTop: '8px' }}>
                                    {formData.motto || 'Sua frase de efeito aqui.'}
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <PenTool className="text-indigo-600" />
                        Assinaturas de E-mail
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Configure assinaturas elegantes para suas campanhas sem tocar em código.</p>
                </div>
                <button
                    onClick={handleNew}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition flex items-center gap-2"
                >
                    <Plus size={20} /> Nova Assinatura
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lista de Assinaturas */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Suas Assinaturas</h3>
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500">Carregando...</div>
                    ) : signatures.length === 0 ? (
                        <div className="bg-gray-50 border-2 border-dashed rounded-xl p-8 text-center">
                            <Info className="mx-auto text-gray-300 mb-2" size={32} />
                            <p className="text-gray-500 text-sm">Nenhuma assinatura criada.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {signatures.map(sig => (
                                <button
                                    key={sig.id}
                                    onClick={() => handleSelect(sig)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${selectedId === sig.id ? 'border-indigo-600 bg-indigo-50 shadow-md ring-1 ring-indigo-600' : 'bg-white border-gray-200 hover:border-indigo-300'
                                        }`}
                                >
                                    <div>
                                        <p className={`font-bold text-sm ${selectedId === sig.id ? 'text-indigo-900' : 'text-gray-700'}`}>{sig.name}</p>
                                        <p className="text-xs text-gray-500">{sig.ownerName}</p>
                                    </div>
                                    {selectedId === sig.id && <CheckCircle size={18} className="text-indigo-600" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Editor e Preview */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b flex items-center gap-2">
                            <Eye size={18} className="text-gray-400" />
                            <span className="text-sm font-bold text-gray-600">Visualização em Tempo Real</span>
                        </div>
                        <div className="p-6 bg-gray-100">
                            {renderPreview()}
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                                    Informações Pessoais
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Interno</label>
                                        <input
                                            type="text" required value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Seu Nome (Exibido)</label>
                                        <input
                                            type="text" required value={formData.ownerName}
                                            onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cargo / Função</label>
                                        <input
                                            type="text" required value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                                    Contato e Branding
                                </h4>
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase">Logo da Assinatura</label>
                                        <div className="flex items-center gap-4 p-3 border rounded-xl bg-gray-50">
                                            <div className="w-16 h-16 rounded-full border bg-white overflow-hidden flex-shrink-0 relative group">
                                                <img
                                                    src={getImageUrl(formData.logoUrl)}
                                                    alt="Logo Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                {isUploading && (
                                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                        <RefreshCcw size={16} className="animate-spin text-indigo-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <label className={`cursor-pointer px-4 py-2 border rounded-lg text-xs font-bold transition flex items-center gap-2 w-fit ${isUploading ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-100 text-gray-700 shadow-sm'}`}>
                                                    <Upload size={14} />
                                                    {isUploading ? `Enviando ${uploadProgress}%` : 'Alterar Logo'}
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleLogoUpload}
                                                        disabled={isUploading}
                                                    />
                                                </label>
                                                <p className="text-[10px] text-gray-400 mt-1">Recomendado: imagem quadrada (ex: 400x400px)</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">WhatsApp</label>
                                        <input
                                            type="text" required value={formData.whatsapp}
                                            onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail de Contato</label>
                                        <input
                                            type="email" required value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-gray-800 border-b pb-2">Configurações de Loja</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome da Loja</label>
                                    <input
                                        type="text" required value={formData.storeName}
                                        onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">URL da Loja</label>
                                    <input
                                        type="url" required value={formData.storeUrl}
                                        onChange={e => setFormData({ ...formData, storeUrl: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Lema / Frase de Efeito</label>
                                <input
                                    type="text" required value={formData.motto}
                                    onChange={e => setFormData({ ...formData, motto: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                            {selectedId && (
                                <button
                                    type="button"
                                    onClick={() => handleDelete(selectedId)}
                                    className="flex items-center gap-2 text-red-500 hover:text-red-700 font-bold text-sm transition"
                                >
                                    <Trash2 size={18} /> Excluir Assinatura
                                </button>
                            )}
                            <div className="flex gap-3 ml-auto">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition flex items-center gap-2 disabled:bg-indigo-400"
                                >
                                    {isSaving ? <CheckCircle className="animate-pulse" /> : <Save size={20} />}
                                    {isSaving ? 'Salvando...' : 'Salvar Assinatura'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
