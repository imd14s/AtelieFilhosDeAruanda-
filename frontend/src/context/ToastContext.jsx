import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[300] flex flex-col gap-2 max-w-md w-full sm:w-auto">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 p-4 rounded-sm shadow-xl animate-fade-in-up transition-all ${toast.type === 'success' ? 'bg-[#0f2A44] text-white' :
                                toast.type === 'error' ? 'bg-red-600 text-white' :
                                    'bg-white text-[#0f2A44] border border-gray-200'
                            }`}
                    >
                        {toast.type === 'success' && <CheckCircle size={18} className="text-[#C9A24D]" />}
                        {toast.type === 'error' && <AlertCircle size={18} />}
                        {toast.type === 'info' && <Info size={18} className="text-[#C9A24D]" />}

                        <p className="font-lato text-xs uppercase tracking-wider flex-grow">{toast.message}</p>

                        <button onClick={() => removeToast(toast.id)} className="opacity-60 hover:opacity-100">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};
