export type ServiceType = 'SHIPPING' | 'PAYMENT' | 'MARKETPLACE';

export interface AdminServiceProvider {
    id: string;
    serviceType: ServiceType;
    code: string;
    name: string;
    enabled: boolean;
    priority: number;
    driverKey?: string;
    healthEnabled: boolean;
}

export interface ProviderConfig {
    providerId: string;
    configJson: string; // JSON string for backend
    environment: 'DEVELOPMENT' | 'PRODUCTION';
    version?: number;
}

// Detailed Mercado Pago Structure
export interface MercadoPagoConfig {
    identification: {
        name: string;
        active: boolean;
        currency: 'BRL' | 'USD';
        market: string;
    };
    credentials: {
        accessToken: string;
        publicKey: string;
    };
    webhooks: {
        url: string;
        secret: string;
        events: string[];
        validateSignature: boolean;
    };
    methods: {
        discovered: string[];
        enabled: {
            card: {
                active: boolean;
                maxInstallments: number;
                interestFree: number;
                descriptor?: string;
                autoCapture: boolean;
                binaryMode: boolean;
            };
            pix: {
                active: boolean;
                expirationMinutes: number;
                discountPercent?: number;
                instructions?: string;
            };
            boleto: {
                active: boolean;
                daysToExpiration: number;
                instructions?: string;
            };
        };
    };
    globalRules: {
        idempotency: boolean;
        strategy: 'uuid_per_attempt';
        timeout?: number;
    };
    payerData: {
        name: 'required' | 'optional' | 'none';
        document: 'required' | 'optional' | 'none';
    };
}

// Legacy/UI Compatibility
export interface ShippingProvider extends AdminServiceProvider {
    config: Record<string, unknown>;
}

export interface PaymentProvider extends AdminServiceProvider {
    config: Record<string, unknown>;
}
