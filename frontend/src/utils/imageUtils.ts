const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.ogg'];

/**
 * Verifica se a URL aponta para um arquivo de vídeo.
 */
export function isVideoUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    const lower = url.toLowerCase().split('?')[0]; // ignora query params
    return VIDEO_EXTENSIONS.some(ext => lower.endsWith(ext));
}

/**
 * Retorna a primeira URL de uma lista de mídias que NÃO seja vídeo.
 * Se todas forem vídeos, retorna a primeira como fallback.
 * Se a lista estiver vazia, retorna o fallback fornecido ou undefined.
 */
export function getFirstImageFromList(
    mediaUrls: string[] | null | undefined,
    fallback?: string
): string | undefined {
    if (!mediaUrls || mediaUrls.length === 0) return fallback;
    const firstImage = mediaUrls.find(url => !isVideoUrl(url));
    return firstImage ?? mediaUrls[0] ?? fallback;
}

export function getImageUrl(url?: string | null): string {
    if (!url || url.startsWith('blob:') || url.startsWith('cid:') || url.startsWith('data:')) {
        return '/images/default.png';
    }

    // Retirar possíveis múltiplas imagens providas por um parser com erro no backend
    let parsedUrl = url;
    if (parsedUrl.includes(',')) {
        parsedUrl = parsedUrl.split(',')[0].trim();
    }

    if (parsedUrl.startsWith('http') || parsedUrl.startsWith('/images/') || parsedUrl.startsWith('/assets/')) {
        return parsedUrl;
    }

    if (parsedUrl.startsWith('public/')) {
        return parsedUrl.replace('public/', '/');
    }

    // Strip /api suffix to get the host base
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const hostBase = apiBase.split('/api')[0];
    
    // Garantir que o parsedUrl comece com / se nâo tiver protocolo
    const normalizedPath = parsedUrl.startsWith('/') ? parsedUrl : `/${parsedUrl}`;
    return `${hostBase}${normalizedPath}`;
}

export interface PixelCrop {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const getCroppedImg = async (imageSrc: string, pixelCrop: PixelCrop): Promise<Blob | null> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return null;
    }

    // Set canvas size to the cropped area
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Draw the cropped image onto the canvas
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    // Return as blob
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob);
        }, 'image/jpeg');
    });
};

const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues
        image.src = url;
    });
