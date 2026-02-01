import { api } from '../api/axios';

export const FileService = {
  upload: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<string>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // O backend retorna o caminho relativo (/api/files/view/xyz.jpg)
    // Se precisarmos da URL completa, concatenamos com a baseURL, 
    // mas geralmente salvamos o caminho relativo no banco.
    return data; 
  }
};
