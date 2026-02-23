/**
 * Converte uma URL de imagem do backend em uma URL completa, ou retorna URLs locais (blob:, data:) como estão.
 * 
 * @param url A URL bruta da imagem
 * @returns A URL formatada para exibição
 */
export function getImageUrl(url?: string): string {
    if (!url) return '';

    // Se já for uma URL completa ou um recurso local (Blob/Data), retorna como está
    if (
        url.startsWith('http') ||
        url.startsWith('blob:') ||
        url.startsWith('data:') ||
        url.startsWith('/') ||
        url.startsWith('./') ||
        url.startsWith('../')
    ) {
        return url;
    }

    // Se for um CID (Content-ID) residual, não deve ser exibido como imagem real
    if (url.startsWith('cid:')) {
        return '';
    }

    // Prepara a base da API removendo o sufixo /api se presente
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const cleanBase = apiUrl.replace(/\/api$/, '');

    // Adiciona a barra inicial se não estiver presente na URL relativa
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;

    return `${cleanBase}${normalizedUrl}`;
}
