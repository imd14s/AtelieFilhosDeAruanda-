import { api } from '../api/axios';

export interface FiscalIntegration {
    id?: string;
    providerName: string;
    apiKey: string;
    apiUrl?: string;
    settings?: Record<string, unknown>;
    active: boolean;
}

export interface CertificateMetadata {
    subjectName: string;
    expirationDate: string;
    issuerName: string;
    isValid: boolean;
}

export const FiscalIntegrationService = {
    async getAll(): Promise<FiscalIntegration[]> {
        const response = await api.get('/fiscal-integrations');
        return response.data;
    },

    async save(data: FiscalIntegration): Promise<FiscalIntegration> {
        const response = await api.post('/fiscal-integrations', data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/fiscal-integrations/${id}`);
    },

    async getCertificateInfo(): Promise<CertificateMetadata | null> {
        try {
            const response = await api.get('/fiscal/certificate/info');
            return response.data;
        } catch {
            return null;
        }
    },

    async uploadCertificate(file: File, password: string): Promise<void> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('password', password);
        await api.post('/fiscal/certificate/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    async revokeCertificate(): Promise<void> {
        await api.delete('/fiscal/certificate');
    }
};
