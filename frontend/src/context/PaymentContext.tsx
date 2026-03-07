import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { TENANT_HEADER } from '../services/productService';

export interface PaymentMethodConfig {
    active: boolean;
    maxInstallments?: number;
    interestFree?: number;
    discountPercent?: number;
}

export interface PaymentSettings {
    mercadoPago: {
        enabled: boolean;
        methods: {
            card: PaymentMethodConfig;
            pix: PaymentMethodConfig;
            boleto: PaymentMethodConfig;
        };
    };
}

interface PaymentContextType {
    settings: PaymentSettings | null;
    loading: boolean;
    error: string | null;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<PaymentSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const response = await api.get('/config/public/mercado-pago/public-key', { headers: TENANT_HEADER });
                const config = response.data;

                if (config && config.publicKey) {
                    setSettings({
                        mercadoPago: {
                            enabled: true, // Se o endpoint retornou, assumimos habilitado ou validamos pelo config
                            methods: {
                                card: {
                                    active: config.cardActive || false,
                                    maxInstallments: config.maxInstallments || 12,
                                    interestFree: config.interestFree || 1,
                                },
                                pix: {
                                    active: config.pixActive || false,
                                    discountPercent: config.pixDiscountPercent || 0,
                                },
                                boleto: {
                                    active: false, // Pode ser adicionado ao backend se necessário
                                }
                            }
                        }
                    });
                }
                setError(null);
            } catch (err) {
                console.error('Error fetching payment settings:', err);
                setError('Não foi possível carregar as configurações de pagamento.');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return (
        <PaymentContext.Provider value={{ settings, loading, error }}>
            {children}
        </PaymentContext.Provider>
    );
};

export const usePayment = () => {
    const context = useContext(PaymentContext);
    if (context === undefined) {
        throw new Error('usePayment must be used within a PaymentProvider');
    }
    return context;
};
