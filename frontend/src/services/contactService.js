import api from './api';

const contactService = {
    /**
     * Envia formulário de contato para o backend.
     * O backend enfileira um e-mail para o admin.
     */
    send: async (data) => {
        try {
            const response = await api.post('/contact', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Erro ao enviar mensagem' };
        }
    },
};

export default contactService;
