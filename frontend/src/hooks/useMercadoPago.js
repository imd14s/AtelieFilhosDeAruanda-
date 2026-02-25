import { useState, useEffect } from 'react';
import { storeService } from '../services/storeService';

/**
 * Hook para carregar o SDK do Mercado Pago e inicializar o objeto 'mp'.
 */
export const useMercadoPago = () => {
    const [mp, setMp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isConfigured, setIsConfigured] = useState(false);
    const [paymentConfig, setPaymentConfig] = useState(null);

    useEffect(() => {
        const loadSdk = async () => {
            if (!window.MercadoPago) {
                const script = document.createElement('script');
                script.src = 'https://sdk.mercadopago.com/js/v2';
                script.async = true;
                script.onload = () => initMp();
                script.onerror = () => {
                    setError('Erro ao carregar o SDK do Mercado Pago.');
                    setLoading(false);
                };
                document.body.appendChild(script);
            } else {
                initMp();
            }
        };

        const initMp = async () => {
            try {
                const configData = await storeService.config.getMercadoPagoPublicKey();
                if (configData && configData.publicKey) {
                    const instance = new window.MercadoPago(configData.publicKey, { locale: 'pt-BR' });
                    setMp(instance);
                    setIsConfigured(true);
                    setPaymentConfig(configData);
                } else {
                    // Se o service retornar null, provavelmente é 404/vazio
                    setIsConfigured(false);
                    setError('CONFIG_MISSING');
                }
            } catch (err) {
                console.error("[useMercadoPago] Erro na inicialização:", err);
                setError('Erro ao inicializar o Mercado Pago.');
            } finally {
                setLoading(false);
            }
        };

        loadSdk();
    }, []);

    return { mp, loading, error, isConfigured, paymentConfig };
};
