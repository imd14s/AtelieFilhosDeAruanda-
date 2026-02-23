import React from 'react';
import { useLoading } from '../../context/LoadingContext';
import Spinner from './Spinner';

const GlobalOverlay: React.FC = () => {
    const { isGlobalLoading } = useLoading();

    if (!isGlobalLoading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/20 backdrop-blur-[1px] cursor-wait">
            <div className="bg-white p-4 rounded-xl shadow-2xl border border-gray-100 flex flex-col items-center gap-3">
                <Spinner size={32} className="text-indigo-600" />
                <p className="text-sm font-medium text-gray-700">Processando...</p>
            </div>
        </div>
    );
};

export default GlobalOverlay;
