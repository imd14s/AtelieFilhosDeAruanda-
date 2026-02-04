import { api } from '../api/axios';

export interface UploadResponse {
    id: string;
    url: string;
}

const MOCK_IMAGES = [
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
    'https://images.unsplash.com/photo-1542272617-08f086302542',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'
];

export const MediaService = {
    upload: async (file: File): Promise<UploadResponse> => {
        // Mock upload
        console.warn('Using Mock Upload');
        await new Promise(resolve => setTimeout(resolve, 1000));
        const randomImage = MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)];
        return {
            id: crypto.randomUUID(),
            url: randomImage
        };
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
