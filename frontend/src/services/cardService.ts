import api from './api';
import { TENANT_HEADER } from './productService';
import { SafeAny } from "../types/safeAny";

const cardService = {
    listCards: (): Promise<SafeAny[]> =>
        api.get('/customer/cards', { headers: TENANT_HEADER }).then(r => r.data),

    saveCard: (token: string): Promise<SafeAny> =>
        api.post('/customer/cards', { token }, { headers: TENANT_HEADER }).then(r => r.data),

    deleteCard: (cardId: string): Promise<void> =>
        api.delete(`/customer/cards/${cardId}`, { headers: TENANT_HEADER }).then(r => r.data),
};

export default cardService;
