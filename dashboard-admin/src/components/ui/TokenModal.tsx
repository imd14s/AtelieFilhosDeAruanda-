import { useState } from 'react';
import { Key } from 'lucide-react';
import BaseModal from './BaseModal';
import Button from './Button';

interface TokenModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (token: string) => void;
}

export function TokenModal({ isOpen, onClose, onSave }: TokenModalProps) {
    const [token, setToken] = useState('');

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title="Configurar Token IA"
            maxWidth="max-w-md"
        >
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                    <Key size={24} />
                    <span className="font-bold">Chave de API OpenAI</span>
                </div>

                <p className="text-sm text-gray-600">
                    Para utilizar a geração automática de descrições, insira sua chave de API da OpenAI (paga).
                    O token será salvo apenas no seu navegador de forma segura.
                </p>

                <input
                    type="password"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="sk-..."
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                    autoFocus
                />

                <div className="flex gap-3 pt-4 border-t">
                    <Button
                        onClick={onClose}
                        variant="secondary"
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => {
                            if (token.trim()) onSave(token.trim());
                        }}
                        disabled={!token.trim()}
                        variant="primary"
                        className="flex-1 shadow-lg"
                    >
                        Salvar Token
                    </Button>
                </div>
            </div>
        </BaseModal>
    );
}
