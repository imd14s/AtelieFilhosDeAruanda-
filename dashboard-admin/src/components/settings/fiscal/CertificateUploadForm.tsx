import React, { useState, useRef } from 'react';
import { UploadCloud, FileType, CheckCircle2, Lock, Eye, EyeOff, AlertCircle, ShieldOff, Calendar, User, Building2 } from 'lucide-react';

export interface CertificateMetadata {
    subjectName: string;
    expirationDate: string;
    issuerName: string;
    isValid: boolean;
}

interface CertificateUploadFormProps {
    currentMetadata: CertificateMetadata | null;
    onUpload: (file: File, password: string) => Promise<void>;
    onRevoke: () => Promise<void>;
    isLoading?: boolean;
}

export function CertificateUploadForm({ currentMetadata, onUpload, onRevoke, isLoading = false }: CertificateUploadFormProps) {
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [confirmRevoke, setConfirmRevoke] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            validateAndSetFile(droppedFile);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            validateAndSetFile(selectedFile);
        }
    };

    const validateAndSetFile = (selectedFile: File) => {
        setError(null);
        const validExtensions = ['.pfx', '.p12'];
        const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

        if (!validExtensions.includes(fileExtension)) {
            setError('Formato inválido. Selecione um arquivo .pfx ou .p12 válido.');
            setFile(null);
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setError('Arquivo muito grande. O limite máximo é de 5MB.');
            setFile(null);
            return;
        }

        setFile(selectedFile);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Selecione um arquivo de certificado.');
            return;
        }
        if (!password) {
            setError('A senha do certificado é obrigatória.');
            return;
        }

        try {
            await onUpload(file, password);
            setFile(null);
            setPassword('');
        } catch (err) {
            const error = err as Error;
            setError(error.message || 'Erro ao processar o certificado.');
        }
    };

    const handleRevoke = async () => {
        try {
            await onRevoke();
            setConfirmRevoke(false);
        } catch (err) {
            const revokeError = err as Error;
            setError(revokeError.message || 'Erro ao revogar o certificado.');
        }
    };

    const hasCertificate = currentMetadata !== null;

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Certificado Digital A1</h3>
            <p className="text-sm text-gray-500 mb-6">
                {hasCertificate
                    ? 'Gerencie o certificado digital vinculado à emissão de notas fiscais.'
                    : 'Importe o arquivo (.pfx/.p12) e forneça a senha de instalação. Os dados serão cifrados antes de salvar.'}
            </p>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* ESTADO 1: Certificado Existente — Apenas Visualização  */}
            {/* ═══════════════════════════════════════════════════════ */}
            {hasCertificate && !confirmRevoke && (
                <div className="space-y-4">
                    {/* Card de Status do Certificado */}
                    <div className={`p-5 rounded-2xl border-2 transition-all ${currentMetadata.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2.5 rounded-xl ${currentMetadata.isValid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                                {currentMetadata.isValid ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
                            </div>
                            <div>
                                <h4 className={`font-bold text-base ${currentMetadata.isValid ? 'text-green-800' : 'text-red-800'}`}>
                                    {currentMetadata.isValid ? 'Certificado Ativo' : 'Certificado Expirado'}
                                </h4>
                                <p className="text-xs text-gray-500">Emissão de NF-e {currentMetadata.isValid ? 'habilitada' : 'suspensa'}</p>
                            </div>
                        </div>

                        {/* Dados do Certificado */}
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-white bg-opacity-60 rounded-xl">
                                <User size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Titular (CN)</span>
                                    <p className="text-sm text-gray-800 font-medium mt-0.5">{currentMetadata.subjectName}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-white bg-opacity-60 rounded-xl">
                                <Calendar size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Validade</span>
                                    <p className="text-sm text-gray-800 font-mono font-medium mt-0.5">{currentMetadata.expirationDate}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 bg-white bg-opacity-60 rounded-xl">
                                <Building2 size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Autoridade Certificadora (CA)</span>
                                    <p className="text-sm text-gray-800 font-medium mt-0.5">{currentMetadata.issuerName}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botão de Revogar */}
                    <button
                        type="button"
                        onClick={() => setConfirmRevoke(true)}
                        disabled={isLoading}
                        className="w-full py-3 px-4 border-2 border-red-200 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        aria-label="Revogar certificado digital e chaves criptográficas"
                    >
                        <ShieldOff size={18} />
                        Revogar Certificado e Chaves
                    </button>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════ */}
            {/* ESTADO 2: Confirmação de Revogação                     */}
            {/* ═══════════════════════════════════════════════════════ */}
            {hasCertificate && confirmRevoke && (
                <div className="p-5 bg-red-50 border-2 border-red-200 rounded-2xl space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-100 rounded-xl text-red-500">
                            <AlertCircle size={22} />
                        </div>
                        <div>
                            <h4 className="font-bold text-red-800 text-base">Confirmar Revogação</h4>
                            <p className="text-red-700 text-sm mt-1 leading-relaxed">
                                Esta ação é <strong>irreversível</strong>. As chaves criptográficas serão permanentemente apagadas e
                                a emissão de notas ficará <strong>suspensa</strong> até que um novo certificado seja importado.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg flex items-center gap-2 font-medium">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => { setConfirmRevoke(false); setError(null); }}
                            disabled={isLoading}
                            className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleRevoke}
                            disabled={isLoading}
                            className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <ShieldOff size={16} />
                            {isLoading ? 'Revogando...' : 'Sim, Revogar Agora'}
                        </button>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════ */}
            {/* ESTADO 3: Sem Certificado — Formulário de Upload       */}
            {/* ═══════════════════════════════════════════════════════ */}
            {!hasCertificate && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isDragging
                            ? 'border-blue-500 bg-blue-50'
                            : file ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                            } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".pfx,.p12"
                            className="hidden"
                        />

                        {file ? (
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-3 bg-green-100 text-green-600 rounded-full">
                                    <FileType size={32} />
                                </div>
                                <span className="font-bold text-gray-800 mt-2">{file.name}</span>
                                <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB Selecionado</span>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    className="mt-2 text-xs font-bold text-red-500 hover:text-red-700"
                                >
                                    Trocar Arquivo
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <UploadCloud size={32} />
                                </div>
                                <span className="font-bold text-gray-700 mt-2">Clique para buscar ou arraste o arquivo aqui</span>
                                <span className="text-xs text-gray-500">Documentos suportados: .PFX, .P12 (Máx. 5MB)</span>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                            <Lock size={12} /> Senha do Certificado
                        </label>
                        <div className="relative mt-1">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                                placeholder="Digite a senha do certificado"
                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-600 transition-all font-mono text-sm disabled:opacity-50 pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                tabIndex={-1}
                                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 font-medium">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={!file || !password || isLoading}
                            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
                        >
                            {isLoading ? 'Processando...' : 'Fazer Upload Seguro'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
