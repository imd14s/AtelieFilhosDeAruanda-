import React, { useState, useRef } from 'react';
import { UploadCloud, FileType, CheckCircle2, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

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

        // Allowed extensions: .pfx, .p12
        const validExtensions = ['.pfx', '.p12'];
        const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

        if (!validExtensions.includes(fileExtension)) {
            setError('Formato inválido. Selecione um arquivo .pfx ou .p12 válido.');
            setFile(null);
            return;
        }

        // Limit to 5MB (very large for a cert, but a safe upper bound)
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
            // Clear on success
            setFile(null);
            setPassword('');
        } catch (err) {
            const error = err as Error;
            setError(error.message || 'Erro ao processar o certificado.');
        }
    };

    const handleRevoke = async () => {
        if (window.confirm('Tem certeza que deseja revogar/apagar o certificado atual? A emissão de notas ficará suspensa.')) {
            await onRevoke();
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Certificado Digital A1</h3>
            <p className="text-sm text-gray-500 mb-6">Importe o arquivo (.pfx/.p12) e forneça a senha de instalação. Os dados serão cifrados antes de salvar.</p>

            {/* Quadro de Status Atual */}
            {currentMetadata && (
                <div className={`mb-8 p-5 rounded-2xl border-2 flex items-start gap-4 transition-all ${currentMetadata.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className={currentMetadata.isValid ? 'text-green-600' : 'text-red-500'}>
                        {currentMetadata.isValid ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    </div>
                    <div className="flex-1">
                        <h4 className={`font-bold text-lg mb-1 ${currentMetadata.isValid ? 'text-green-800' : 'text-red-800'}`}>
                            {currentMetadata.isValid ? 'Certificado Ativo' : 'Certificado Expirado ou Inválido'}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-3">
                            <div>
                                <span className={`font-bold ${currentMetadata.isValid ? 'text-green-700' : 'text-red-700'}`}>Titular (CN):</span>
                                <p className="text-gray-700">{currentMetadata.subjectName}</p>
                            </div>
                            <div>
                                <span className={`font-bold ${currentMetadata.isValid ? 'text-green-700' : 'text-red-700'}`}>Validade:</span>
                                <p className="text-gray-700 font-mono">{currentMetadata.expirationDate}</p>
                            </div>
                            <div className="md:col-span-2 mt-1">
                                <span className={`font-bold ${currentMetadata.isValid ? 'text-green-700' : 'text-red-700'}`}>Autoridade (CA):</span>
                                <p className="text-gray-700 text-xs">{currentMetadata.issuerName}</p>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-opacity-20 border-gray-800 flex justify-end">
                            <button
                                onClick={handleRevoke}
                                disabled={isLoading}
                                className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Processando...' : 'Revogar Certificado e Chaves'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Formulário de Upload */}
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
                            placeholder="DiG1t3 5uA 5eNh4!"
                            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-600 transition-all font-mono text-sm disabled:opacity-50 pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                            tabIndex={-1}
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
                        {isLoading ? 'Cifrando arquivo...' : 'Fazer Upload Seguro'}
                    </button>
                </div>
            </form>
        </div>
    );
}
