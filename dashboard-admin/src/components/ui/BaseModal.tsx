import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}

const BaseModal: React.FC<BaseModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'max-w-md'
}) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEsc);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Content */}
            <div className={`bg-white rounded-xl shadow-2xl w-full ${maxWidth} relative z-10 overflow-hidden animate-in zoom-in-95 fade-in duration-200`}>
                <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[85vh]">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default BaseModal;
