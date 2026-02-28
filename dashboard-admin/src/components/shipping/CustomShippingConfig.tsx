import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import Button from '../ui/Button';

interface CustomShippingConfigProps {
    config: Record<string, unknown>;
    onChange: (newConfig: Record<string, unknown>) => void;
    onSaveConfig: (fileToUpload: File | null) => Promise<void>;
    totalCeps: number;
    uploading: boolean;
}

export function CustomShippingConfig({ config, onChange, onSaveConfig, totalCeps, uploading }: CustomShippingConfigProps) {
    const [file, setFile] = useState<File | null>(null);

    const price = config.price as string || '';
    const days = config.days as string || '';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            if (selectedFile) {
                setFile(selectedFile);
            }
        }
    };

    const handleSaveGeneral = async () => {
        await onSaveConfig(file);
        if (file) setFile(null);
    };

    return (
        <div className="bg-gray-50 border p-6 rounded-2xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4 className="font-bold text-gray-800 text-lg">Regras de Cobrança</h4>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Preço Fixo de Frete (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={price === '0' || price === '0.00' ? '' : price}
                            onChange={e => onChange({ ...config, price: e.target.value })}
                        />
                        <p className="text-xs text-gray-500">Valor cobrado caso o CEP do cliente esteja na planilha.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Prazo de Entrega (Dias Úteis)</label>
                        <input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={days === '0' || days === '' ? '' : days}
                            onChange={e => onChange({ ...config, days: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="font-bold text-gray-800 text-lg">Áreas de Cobertura (CEPs)</h4>

                    <div className="p-4 border border-dashed border-indigo-200 bg-white rounded-xl text-center space-y-3 relative group">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        />
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                            {file ? <FileText size={24} /> : <UploadCloud size={24} />}
                        </div>
                        <div>
                            <p className="font-bold text-sm text-gray-700">
                                {file ? file.name : "Clique ou arraste a planilha CSV aqui"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {file ? `Tamanho: ${(file.size / 1024).toFixed(1)} KB` : "Arquivo .CSV com uma coluna contendo apenas os CEPs atendidos"}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        {totalCeps > 0 ? (
                            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                                <CheckCircle2 size={16} /> <b>{totalCeps}</b> CEPs cadastrados na base.
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium">
                                <AlertCircle size={16} /> Nenhum CEP cadastrado ainda.
                            </div>
                        )}
                        <p className="text-[11px] text-gray-500 leading-tight">
                            Aviso: O envio de uma nova planilha <b>apaga</b> a lista de CEPs antiga e a substitui completamente pela nova seleção.
                        </p>
                    </div>
                </div>
            </div>

            <div className="border-t pt-6 flex justify-end">
                <Button
                    variant="primary"
                    onClick={handleSaveGeneral}
                    disabled={uploading}
                    className="flex items-center gap-2 px-8 shadow-lg shadow-indigo-100"
                >
                    {uploading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                            Enviando Planilha...
                        </>
                    ) : (
                        <>
                            <Save size={18} /> Salvar Regras & CEPs
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
