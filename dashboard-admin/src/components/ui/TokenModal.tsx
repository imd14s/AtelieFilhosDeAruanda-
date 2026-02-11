import { useState } from 'react';
import { X, Key } from 'lucide-react';

interface TokenModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (token: string) => void;
}

export function TokenModal({ isOpen, onClose, onSave }: TokenModalProps) {
    const [token, setToken] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Key size={20} className="text-indigo-600" />
                        Configurar Token IA
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    Para utilizar a geração automática de descrições, insira sua chave de API da OpenAI (paga).
                    O token será salvo apenas no seu navegador.
                </p>

                <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="sk-..."
                    className="w-full p-2 border rounded-lg mb-4 font-mono text-sm"
                    autoFocus
                />

                <div className="flex gap-2 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => {
                            if (token.trim()) onSave(token.trim());
                        }}
                        disabled={!token.trim()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                        Salvar Token
                    </button>
                </div>
            </div>
        </div>
    );
}
