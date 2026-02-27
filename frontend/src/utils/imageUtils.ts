/**
 * Formats a URL for Cloudinary with optimization parameters.
 * Parameters:
 * - f_auto: Automatically choose the best format (WebP/AVIF)
 * - q_auto: Automatically optimize quality
 * - c_limit: Limit size preserving aspect ratio
 */
export function getOptimizedImageUrl(url: string, width?: number, height?: number): string {
    if (!url || !url.includes('cloudinary.com')) {
        return getImageUrl(url);
    }

    // Parameters for Cloudinary
    const params = ['f_auto', 'q_auto'];
    if (width) params.push(`w_${width}`);
    if (height) params.push(`h_${height}`);
    params.push('c_limit');

    const paramsString = params.join(',');

    // Cloudinary URL usually follows: .../upload/v1234567/path/to/image.jpg
    // We want to insert transformations: .../upload/f_auto,q_auto,.../v1234567/path/to/image.jpg
    if (url.includes('/upload/')) {
        return url.replace('/upload/', `/upload/${paramsString}/`);
    }

    return url;
}

export function getImageUrl(url?: string | null): string {
    if (!url || url.startsWith('blob:') || url.startsWith('cid:') || url.startsWith('data:')) {
        return '/images/default.png';
    }

    if (url.startsWith('http') || url.startsWith('/images/') || url.startsWith('/assets/')) {
        return url;
    }

    // Strip /api suffix to get the host base
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const hostBase = apiBase.split('/api')[0];
    return `${hostBase}${url}`;
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
