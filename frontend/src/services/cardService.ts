import api from './api';
import { TENANT_HEADER } from './productService';

const cardService = {
    listCards: (): Promise<any[]> =>
        api.get('/customer/cards', { headers: TENANT_HEADER }).then(r => r.data),

    saveCard: (token: string): Promise<any> =>
        api.post('/customer/cards', { token }, { headers: TENANT_HEADER }).then(r => r.data),

    deleteCard: (cardId: string): Promise<void> =>
        api.delete(`/customer/cards/${cardId}`, { headers: TENANT_HEADER }).then(r => r.data),
};

export default cardService;
