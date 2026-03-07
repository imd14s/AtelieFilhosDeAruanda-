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
                const response = await api.get('/settings/payment', { headers: TENANT_HEADER });
                const providers = response.data;

                const mp = providers.find((p: any) => p.code === 'MERCADO_PAGO');

                if (mp) {
                    const config = mp.config ? (typeof mp.config === 'string' ? JSON.parse(mp.config) : mp.config) : {};
                    const methods = config.methods?.enabled || {};

                    setSettings({
                        mercadoPago: {
                            enabled: mp.enabled,
                            methods: {
                                card: {
                                    active: methods.card?.active || false,
                                    maxInstallments: methods.card?.maxInstallments || 12,
                                    interestFree: methods.card?.interestFree || 1,
                                },
                                pix: {
                                    active: methods.pix?.active || false,
                                    discountPercent: methods.pix?.discountPercent || 0,
                                },
                                boleto: {
                                    active: methods.boleto?.active || false,
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
