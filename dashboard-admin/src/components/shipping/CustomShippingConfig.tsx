import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import Button from '../ui/Button';

interface CustomShippingConfigProps {
    config: Record<string, unknown>;
    onChange: (newConfig: Record<string, unknown>) => void;
    onSaveConfig: () => Promise<void>;
    totalCeps: number;
    uploading: boolean;
    onClearCeps: () => Promise<void>;
    onUploadChunk: (chunk: string[]) => Promise<void>;
    onUploadComplete: (newCount: number) => void;
}

export function CustomShippingConfig({ config, onChange, onSaveConfig, totalCeps, uploading, onClearCeps, onUploadChunk, onUploadComplete }: CustomShippingConfigProps) {
    const [file, setFile] = useState<File | null>(null);
    const [previewCount, setPreviewCount] = useState<number | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [isUploadingCeps, setIsUploadingCeps] = useState(false);
    const [migratedCount, setMigratedCount] = useState<number | null>(null);

    const name = config.name as string || '';
    const price = config.price as string || '';
    const days = config.days as string || '';

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            if (selectedFile) {
                setFile(selectedFile);
                startRealTimeUpload(selectedFile);
            }
        }
    };

    const startRealTimeUpload = async (selectedFile: File) => {
        setIsParsing(true);
        setMigratedCount(0);
        const cleanCeps: string[] = [];

        try {
            const text = await selectedFile.text();
            const lines = text.split('\n').filter(line => line.trim().length > 0);

            let startIndex = 0;
            if (lines.length > 0 && lines[0]?.toLowerCase().includes('cep')) {
                startIndex = 1;
            }

            for (let i = startIndex; i < lines.length; i++) {
                const line = lines[i]?.trim();
                if (!line) continue;
                const cols = line.split(',');
                const rawCep = cols[0] ? cols[0].split(';')[0] : '';
                if (!rawCep) continue;

                const clean = rawCep.replace(/\D/g, '');
                if (clean.length === 8) {
                    cleanCeps.push(clean);
                }
            }

            setPreviewCount(cleanCeps.length);
        } catch {
            setPreviewCount(null);
        } finally {
            setIsParsing(false);
        }

        if (cleanCeps.length === 0) return;

        setIsUploadingCeps(true);
        try {
            await onClearCeps();
            const chunkSize = 1500;
            let currentMigrated = 0;

            for (let i = 0; i < cleanCeps.length; i += chunkSize) {
                const chunk = cleanCeps.slice(i, i + chunkSize);
                await onUploadChunk(chunk);
                currentMigrated += chunk.length;
                setMigratedCount(currentMigrated);
                onUploadComplete(currentMigrated);
            }
            setFile(null);
            setPreviewCount(null);
            setMigratedCount(null);
        } catch (error) {
            console.error('Falha ao processar as chunks de CEPs', error);
        } finally {
            setIsUploadingCeps(false);
        }
    };

    const handleSaveGeneral = async () => {
        await onSaveConfig();
    };

    return (
        <div className="bg-white border p-8 rounded-3xl space-y-8 shadow-sm">
            <h4 className="font-bold text-gray-800 text-lg border-b pb-4">Regras de Cobrança e Região</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Nome da Transportadora</label>
                    <input
                        type="text"
                        placeholder="Ex: Entrega Local Motoboy"
                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        value={name}
                        onChange={e => onChange({ ...config, name: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Preço Fixo (R$)</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        value={price === '0' || price === '0.00' ? '' : price}
                        onChange={e => onChange({ ...config, price: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Prazo Médio (Dias Úteis)</label>
                    <input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                        value={days === '0' || days === '' ? '' : days}
                        onChange={e => onChange({ ...config, days: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pt-4">
                <div className="space-y-4">
                    <label className="text-sm font-semibold text-gray-700 block">Zonas de Entrega (Mapeamento CEP) <span className="text-red-500">*</span></label>
                    <div className="p-8 border-2 border-dashed border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/80 transition-colors rounded-2xl text-center flex flex-col items-center justify-center relative cursor-pointer group min-h-[160px]">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        />
                        <div className="w-14 h-14 mb-3 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            {file ? <FileText size={28} /> : <UploadCloud size={28} />}
                        </div>
                        <p className="font-bold text-sm text-gray-800 max-w-[80%] truncate">
                            {file ? file.name : "Clique ou arraste sua planilha de CEPs aqui"}
                        </p>
                        <div className="text-xs text-gray-500 mt-2 w-full">
                            {isParsing ? (
                                <span className="flex items-center gap-2 justify-center font-medium text-indigo-600">
                                    <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    Extraindo e formatando CEPs...
                                </span>
                            ) : isUploadingCeps && file ? (
                                <div className="space-y-2 mt-4 mx-auto w-10/12 max-w-sm">
                                    <div className="flex justify-between text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                                        <span>Migrando para Banco de Dados</span>
                                        <span>{migratedCount?.toLocaleString('pt-BR')} / {previewCount?.toLocaleString('pt-BR')}</span>
                                    </div>
                                    <div className="w-full bg-indigo-100 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="bg-indigo-600 h-full transition-all duration-300 relative"
                                            style={{ width: `${Math.round(((migratedCount || 0) / (previewCount || 1)) * 100)}%` }}
                                        >
                                            <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            ) : file ? (
                                `Tamanho: ${(file.size / 1024).toFixed(1)} KB`
                            ) : (
                                "Aceita apenas extensões .CSV"
                            )}
                        </div>
                    </div>

                    {(totalCeps > 0 || previewCount !== null) && (
                        <div className="bg-green-50 rounded-2xl p-4 flex items-center justify-between border border-green-100 mt-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-xl text-green-600">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-green-800 uppercase tracking-widest">Registros de Região Ativos</p>
                                    <p className="text-2xl font-black text-green-700">{totalCeps.toLocaleString('pt-BR')} <span className="text-sm font-medium">CEPs salvos localmente</span></p>
                                </div>
                            </div>
                            {previewCount !== null && (
                                <div className="text-right border-l-2 border-green-200 pl-4 ml-4">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase">Neste arquivo</p>
                                    <p className="text-lg font-bold text-indigo-600">+{previewCount.toLocaleString('pt-BR')}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 h-full shadow-sm">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-amber-500 shrink-0" size={24} />
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-bold text-amber-900 text-sm">Como deve ser meu arquivo?</h4>
                                <p className="text-[13px] text-amber-800 mt-1 leading-relaxed">
                                    O motor interno vai mapear unicamente os valores da coluna <span className="font-mono bg-amber-200/50 px-1 font-bold rounded">CEP</span>. Você pode usar uma exportação de tabela dos correios ou melhor envio sem apagar outras colunas (como Filiais e Serviço).
                                </p>
                            </div>

                            <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden text-xs font-mono">
                                <div className="bg-amber-100/50 py-2 px-4 flex gap-4 text-amber-900 font-bold border-b border-amber-200">
                                    <span className="w-16 opacity-50">Filial</span>
                                    <span className="w-24 opacity-50">Servico</span>
                                    <span className="text-amber-800 bg-amber-200 px-1.5 rounded">CEP</span>
                                </div>
                                <div className="py-2.5 px-4 flex gap-4 border-b border-gray-100 cursor-default hover:bg-gray-50 text-gray-500">
                                    <span className="w-16 opacity-40">33099</span>
                                    <span className="w-24 opacity-40">J3 FLEX SP</span>
                                    <span className="font-medium text-gray-800 bg-indigo-50 px-1">01001-001</span>
                                </div>
                                <div className="py-2.5 px-4 flex gap-4 cursor-default hover:bg-gray-50 text-gray-500">
                                    <span className="w-16 opacity-40">33100</span>
                                    <span className="w-24 opacity-40">J3 FLEX SP</span>
                                    <span className="font-medium text-gray-800 bg-indigo-50 px-1">01001-010</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t pt-6 flex justify-end">
                <Button
                    variant="primary"
                    onClick={handleSaveGeneral}
                    disabled={uploading || isUploadingCeps || !name}
                    className="flex items-center gap-2 px-8 py-3 shadow-lg shadow-indigo-200/50"
                >
                    {uploading || isUploadingCeps ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                            {isUploadingCeps ? "Sincronizando..." : "Salvando..."}
                        </>
                    ) : (
                        <>
                            <Save size={18} /> Salvar Configuração
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
