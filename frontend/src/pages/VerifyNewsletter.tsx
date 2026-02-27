/* eslint-disable */
import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { SafeAny } from "../types/safeAny";

type VerificationStatus = 'loading' | 'success' | 'error';

const VerifyNewsletter: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<VerificationStatus>('loading');
    const [message, setMessage] = useState<string>('');
    const hasAttempted = useRef<boolean>(false);

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setMessage('Link de verificação inválido ou expirado.');
            return;
        }

        const verifyToken = async () => {
            if (hasAttempted.current) return;
            hasAttempted.current = true;

            try {
                const response = await axios.post<{ message: string }>(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/newsletter/verify`,
                    { token }
                );
                setStatus('success');
                setMessage(response.data.message || 'Inscrição confirmada com sucesso! Bem-vindo(a) ao Ateliê.');
            } catch (error: SafeAny) {
                setStatus('error');
                if (error.response?.data?.message) {
                    setMessage(error.response.data.message);
                } else {
                    setMessage('Ocorreu um erro ao validar sua inscrição. Tente novamente mais tarde.');
                }
            }
        };

        verifyToken();
    }, [searchParams]);

    return (
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
            {status === 'loading' && (
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-[#C9A24D] border-t-transparent rounded-full animate-spin mb-6"></div>
                    <h2 className="text-2xl font-playfair mb-2">Verificando sua inscrição...</h2>
                    <p className="text-gray-500 font-lato">Aguarde um momento.</p>
                </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center max-w-lg">
                    <div className="w-16 h-16 bg-[#e6f4ea] text-[#1e8e3e] flex items-center justify-center rounded-full mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 className="text-3xl font-playfair mb-4 text-[#0f2A44]">Inscrição Confirmada!</h2>
                    <p className="font-lato text-gray-600 mb-8">{message}</p>
                    <Link to="/" className="bg-[#0f2A44] text-white px-8 py-3 tracking-widest text-xs uppercase hover:bg-[#1a4066] transition">
                        Explorar a Loja
                    </Link>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center max-w-lg">
                    <div className="w-16 h-16 bg-[#fce8e6] text-[#d93025] flex items-center justify-center rounded-full mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                    <h2 className="text-3xl font-playfair mb-4 text-[#0f2A44]">Ops!</h2>
                    <p className="font-lato text-gray-600 mb-8">{message}</p>
                    <Link to="/" className="bg-transparent border border-[#0f2A44] text-[#0f2A44] px-8 py-3 tracking-widest text-xs uppercase hover:bg-gray-50 transition">
                        Voltar para o Início
                    </Link>
                </div>
            )}
        </div>
    );
};

export default VerifyNewsletter;
