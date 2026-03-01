export interface Card {
    id: string;
    payment_method?: {
        id: string;
    };
    last_four_digits?: string;
    cardholder?: {
        name: string;
    };
    expiration_month?: number;
    expiration_year?: number;
}

export interface InstallmentOption {
    installments: number;
    installment_rate: number;
    discount_rate: number;
    installment_amount: number;
    total_amount: number;
    recommended_message: string;
}
