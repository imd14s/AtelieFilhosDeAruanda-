import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export function ComingSoonModal({ isOpen, onClose, title, message }: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-8 text-center relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                    aria-label="Fechar"
                >
                    <X size={20} />
                </button>

                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-indigo-600" />
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {title || 'Em Breve!'}
                </h3>

                <p className="text-gray-500 text-sm leading-relaxed">
                    {message || 'Essa funcionalidade será liberada em uma atualização futura. Estamos trabalhando para trazer essa novidade para você!'}
                </p>

                <button
                    onClick={onClose}
                    className="mt-6 w-full bg-indigo-600 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-indigo-700 transition"
                >
                    Entendi
                </button>
            </div>
        </div>
    );
}
