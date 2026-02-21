import { api } from '../api/axios';

export interface UploadResponse {
    id: string;
    url: string;
}

export const MediaService = {
    upload: async (file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('public', 'true');

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

    removeBackground: async (_mediaId: string): Promise<string> => {
        throw new Error('COMING_SOON');
    },

    generateMockup: async (_mediaId: string, _modelId: string): Promise<string> => {
        throw new Error('COMING_SOON');
    }
};
