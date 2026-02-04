export interface ShippingProvider {
    id: string;
    name: string; // 'CORREIOS' | 'MELHOR_ENVIO' | 'FIXED'
    enabled: boolean;
    config: Record<string, string>; // { "cepOrigem": "...", "token": "..." }
    rules?: {
        minWeight?: number;
        maxWeight?: number;
        freeShippingAbove?: number;
    };
}

export interface PaymentProvider {
    id: string;
    name: string; // 'STRIPE' | 'MERCADO_PAGO' | 'PIX'
    enabled: boolean;
    config: Record<string, string>; // { "publicKey": "...", "secretKey": "..." }
    installments?: {
        max: number;
        interestFree: number;
    };
}
