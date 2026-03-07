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
    config: {
        pixActive: boolean;
        cardActive: boolean;
        maxInstallments: number;
        interestFree: number;
        pixDiscountPercent: number;
    } | null;
}

export const useMercadoPago = (): UseMercadoPago => {
    const [mp, setMp] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isConfigured, setIsConfigured] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [config, setConfig] = useState<UseMercadoPago['config']>(null);

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
                        setConfig(null);
                    }
                    return;
                }

                if (mounted) {
                    setConfig({
                        pixActive: configData.pixActive ?? false,
                        cardActive: configData.cardActive ?? false,
                        maxInstallments: configData.maxInstallments ?? 12,
                        interestFree: configData.interestFree ?? 1,
                        pixDiscountPercent: configData.pixDiscountPercent ?? 0
                    });
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

    return { mp, loading, isConfigured, error, config };
};
