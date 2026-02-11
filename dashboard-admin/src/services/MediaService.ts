import { api } from '../api/axios';

export interface UploadResponse {
    id: string;
    url: string;
}



export const MediaService = {
    upload: async (file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        // Assumindo endpoint realista conforme padrão
        const { data } = await api.post<UploadResponse>('/media/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            }
        });
        return data;
    },

    removeBackground: async (mediaId: string): Promise<string> => {
        console.warn('Using Mock AI Remove Background');
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Retorna uma imagem com "fundo removido" (mock)
        return 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?bg=removed';
    },

    generateMockup: async (mediaId: string, modelId: string): Promise<string> => {
        console.warn('Using Mock AI Mockup Generation');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return 'https://images.unsplash.com/photo-1542272617-08f086302542?mockup=generated';
    }
};
