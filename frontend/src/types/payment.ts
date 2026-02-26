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
