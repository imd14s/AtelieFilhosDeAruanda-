import { useState, useEffect } from 'react';
import { configService } from '../services/orderService';

// Tipagem global para o SDK do Mercado Pago
declare global {
    interface Window {
        MercadoPago: any;
    }
}

interface UseMercadoPago {
    mp: any;
    loading: boolean;
    isConfigured: boolean;
    error: string | null;
}

export const useMercadoPago = (): UseMercadoPago => {
    const [mp, setMp] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isConfigured, setIsConfigured] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const initMP = async () => {
            try {
                const configData = await configService.getMercadoPagoPublicKey();
                const publicKey = configData?.publicKey;

                if (!publicKey || publicKey === 'YOUR_PUBLIC_KEY') {
                    if (mounted) {
                        setIsConfigured(false);
                        setLoading(false);
                    }
                    return;
                }

                if (!window.MercadoPago) {
                    // Se o script não carregou, tentamos novamente em 1s
                    setTimeout(initMP, 1000);
                    return;
                }

                const mpInstance = new window.MercadoPago(publicKey, {
                    locale: 'pt-BR'
                });

                if (mounted) {
                    setMp(mpInstance);
                    setIsConfigured(true);
                    setLoading(false);
                }
            } catch (err: any) {
                console.error('[useMercadoPago] Erro:', err);
                if (mounted) {
                    setError('Erro ao carregar Mercado Pago');
                    setLoading(false);
                }
            }
        };

        initMP();

        return () => {
            mounted = false;
        };
    }, []);

    return { mp, loading, isConfigured, error };
};
