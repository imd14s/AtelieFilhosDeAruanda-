import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const UnsubscribeNewsletter: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState<string>('');
    const hasAttempted = useRef<boolean>(false);

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setMessage('Link de cancelamento inválido. Se o problema persistir, entre em contato com nosso suporte.');
            return;
        }

        const unsubscribeToken = async () => {
            if (hasAttempted.current) return;
            hasAttempted.current = true;

            try {
                const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/newsletter/unsubscribe`, { token });
                setStatus('success');
                setMessage(response.data.message || 'Inscrição cancelada com sucesso. Você não receberá mais e-mails da nossa Newsletter.');
            } catch (error: any) {
                setStatus('error');
                if (error.response?.data?.message) {
                    setMessage(error.response.data.message);
                } else {
                    setMessage('Ocorreu um erro ao cancelar sua inscrição. Lamentamos pelo inconveniente.');
                }
            }
        };

        unsubscribeToken();
    }, [searchParams]);

    return (
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
            {status === 'loading' && (
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mb-6"></div>
                    <h2 className="text-2xl font-playfair mb-2">Processando solicitação...</h2>
                </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center max-w-lg">
                    <div className="w-16 h-16 bg-gray-100 text-gray-500 flex items-center justify-center rounded-full mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </div>
                    <h2 className="text-3xl font-playfair mb-4 text-[#0f2A44]">Poxa, que pena que nos deixou!</h2>
                    <p className="font-lato text-gray-600 mb-8">{message}</p>
                    <Link to="/" className="bg-[#0f2A44] text-white px-8 py-3 tracking-widest text-xs uppercase hover:bg-[#1a4066] transition">
                        Voltar para a Loja
                    </Link>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center max-w-lg">
                    <div className="w-16 h-16 bg-[#fce8e6] text-[#d93025] flex items-center justify-center rounded-full mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h2 className="text-3xl font-playfair mb-4 text-[#0f2A44]">Ocorreu um Erro</h2>
                    <p className="font-lato text-gray-600 mb-8">{message}</p>
                    <Link to="/" className="bg-transparent border border-[#0f2A44] text-[#0f2A44] px-8 py-3 tracking-widest text-xs uppercase hover:bg-gray-50 transition">
                        Voltar para a Loja
                    </Link>
                </div>
            )}
        </div>
    );
};

export default UnsubscribeNewsletter;
