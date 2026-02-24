/**
 * Converts a relative image path from the backend into a full URL.
 * Backend returns paths like /uploads/filename.jpg which need the API base host prepended.
 * If the URL is already absolute (starts with http), it is returned as-is.
 *
 * @param {string} url - The raw image URL from the API.
 * @returns {string} - The full image URL.
 */
export function getImageUrl(url) {
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

export const getCroppedImg = async (imageSrc, pixelCrop) => {
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

const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues
        image.src = url;
    });
