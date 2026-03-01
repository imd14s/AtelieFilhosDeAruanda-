import { useState, useEffect } from 'react';
import { configService } from '../services/orderService';
import { SafeAny } from "../types/safeAny";

// Tipagem global para o SDK do Mercado Pago
interface MercadoPagoInstance {
    cardForm: (config: SafeAny) => SafeAny; // Will refine config/return types later or use unknown
    [key: string]: SafeAny;
}

declare global {
    interface Window {
        MercadoPago: new (publicKey: string, options: { locale: string }) => MercadoPagoInstance;
    }
}

interface UseMercadoPago {
    mp: MercadoPagoInstance | null;
    loading: boolean;
    isConfigured: boolean;
    pixActive: boolean;
    cardActive: boolean;
    pixDiscountPercent: number;
    maxInstallments: number;
    interestFree: number;
    error: string | null;
}

export const useMercadoPago = (): UseMercadoPago => {
    const [mp, setMp] = useState<MercadoPagoInstance | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isConfigured, setIsConfigured] = useState<boolean>(false);
    const [pixActive, setPixActive] = useState<boolean>(false);
    const [cardActive, setCardActive] = useState<boolean>(false);
    const [pixDiscountPercent, setPixDiscountPercent] = useState<number>(0);
    const [maxInstallments, setMaxInstallments] = useState<number>(12);
    const [interestFree, setInterestFree] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const initMP = async () => {
            try {
                const configData = await configService.getMercadoPagoPublicKey();
                const publicKey = configData?.publicKey;

                if (!publicKey || publicKey === 'YOUR_PUBLIC_KEY' || publicKey.includes('...')) {
                    console.warn('[useMercadoPago] Chave pública inválida ou ausente:', publicKey);
                    if (mounted) {
                        setIsConfigured(false);
                        setLoading(false);
                        setError('Configuração de pagamento incompleta');
                    }
                    return;
                }

                if (!window.MercadoPago) {
                    console.warn('[useMercadoPago] SDK não encontrado, tentando novamente...');
                    setTimeout(initMP, 1000);
                    return;
                }

                try {
                    const mpInstance = new window.MercadoPago(publicKey, {
                        locale: 'pt-BR'
                    });

                    if (mounted) {
                        setMp(mpInstance);
                        setIsConfigured(true);
                        setPixActive(configData?.pixActive ?? false);
                        setCardActive(configData?.cardActive ?? false);
                        setPixDiscountPercent(configData?.pixDiscountPercent ?? 0);
                        setMaxInstallments(configData?.maxInstallments ?? 12);
                        setInterestFree(configData?.interestFree ?? 1);
                        setLoading(false);
                        setError(null);
                    }
                } catch (sdkErr) {
                    console.error('[useMercadoPago] Erro ao instanciar SDK:', sdkErr);
                    if (mounted) {
                        setError('Falha na conexão com Mercado Pago');
                        setLoading(false);
                    }
                }
            } catch (err: unknown) {
                console.error('[useMercadoPago] Erro na requisição de config:', err);
                if (mounted) {
                    setError('Erro ao carregar configurações de pagamento');
                    setLoading(false);
                }
            }
        };

        initMP();

        return () => {
            mounted = false;
        };
    }, []);

    return { mp, loading, isConfigured, pixActive, cardActive, pixDiscountPercent, maxInstallments, interestFree, error };
};
