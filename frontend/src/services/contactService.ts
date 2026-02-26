import api from './api';
import { TENANT_HEADER } from './productService';

const contactService = {
    /**
     * Envia formulário de contato para o backend.
     * O backend enfileira um e-mail para o admin.
     */
    send: async (data: any): Promise<any> => {
        try {
            const response = await api.post('/contact', data, { headers: TENANT_HEADER });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || { message: 'Erro ao enviar mensagem' };
        }
    },
};

export default contactService;
