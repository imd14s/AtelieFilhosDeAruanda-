
export interface EmissionConfigData {
    taxRegime: string;
    environment: string;
    invoiceSeries: string;
    invoiceNumber: string;
}

interface EmissionConfigFormProps {
    data: EmissionConfigData;
    onChange: (field: keyof EmissionConfigData, value: string) => void;
    disabled?: boolean;
}

export function EmissionConfigForm({ data, onChange, disabled }: EmissionConfigFormProps) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Parâmetros de Emissão (SEFAZ)</h3>
                <p className="text-sm text-gray-500 mb-6">Definições técnicas e numeração das suas Notas Fiscais Eletrônicas.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Regime Tributário</label>
                        <select
                            value={data.taxRegime}
                            onChange={(e) => onChange('taxRegime', e.target.value)}
                            disabled={disabled}
                            className="w-full mt-1 p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-600 transition-all text-sm disabled:opacity-50"
                        >
                            <option value="">Selecione...</option>
                            <option value="SIMPLES_NACIONAL">Simples Nacional (CRT 1)</option>
                            <option value="SIMPLES_EXCESSO_RECEITA">Simples Nacional - Excesso de Sublimite (CRT 2)</option>
                            <option value="REGIME_NORMAL">Regime Normal / Lucro Presumido (CRT 3)</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Ambiente Sefaz</label>
                        <select
                            value={data.environment}
                            onChange={(e) => onChange('environment', e.target.value)}
                            disabled={disabled}
                            className={`w-full mt-1 p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-600 transition-all font-bold text-sm disabled:opacity-50 ${data.environment === 'PRODUCAO' ? 'text-green-700' : 'text-amber-600'}`}
                        >
                            <option value="HOMOLOGACAO">Homologação (Testes sem valor fiscal)</option>
                            <option value="PRODUCAO">Produção (Notas de Fato)</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Série da NF-e</label>
                        <input
                            type="number"
                            min="1"
                            max="999"
                            value={data.invoiceSeries === '0' || data.invoiceSeries === '' ? '' : data.invoiceSeries}
                            onChange={(e) => onChange('invoiceSeries', e.target.value)}
                            disabled={disabled}
                            className="w-full mt-1 p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-600 transition-all font-mono text-sm disabled:opacity-50"
                            placeholder="0"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Normalmente "1" para a matriz.</p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Último Número Emitido</label>
                        <input
                            type="number"
                            min="0"
                            value={data.invoiceNumber === '0' || data.invoiceNumber === '' ? '' : data.invoiceNumber}
                            onChange={(e) => onChange('invoiceNumber', e.target.value)}
                            disabled={disabled}
                            className="w-full mt-1 p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-blue-600 transition-all font-mono text-sm disabled:opacity-50"
                            placeholder="0"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">A próxima nota utilizará o (Nº Atual + 1).</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
