export interface Address {
    id?: string;
    label?: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    document?: string;
    type?: string;
    isDefault?: boolean;
}
