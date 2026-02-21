import api from './api';

const cardService = {
    listCards: () => api.get('/customer/cards').then(r => r.data),

    saveCard: (token) => api.post('/customer/cards', { token }).then(r => r.data),

    deleteCard: (cardId) => api.delete(`/customer/cards/${cardId}`).then(r => r.data),
};

export default cardService;
