import api from './api';
import { TENANT_HEADER } from './productService';
import { SafeAny } from "../types/safeAny";

const contactService = {
    /**
     * Envia formulário de contato para o backend.
     * O backend enfileira um e-mail para o admin.
     */
    send: async (data: SafeAny): Promise<SafeAny> => {
        try {
            const response = await api.post('/contact', data, { headers: TENANT_HEADER });
            return response.data;
        } catch (error: SafeAny) {
            throw error.response?.data || { message: 'Erro ao enviar mensagem' };
        }
    },
};

export default contactService;
