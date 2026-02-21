/**
 * Converts a relative image path from the backend into a full URL.
 * Backend returns paths like /uploads/filename.jpg which need the API base host prepended.
 * If the URL is already absolute (starts with http), it is returned as-is.
 *
 * @param {string} url - The raw image URL from the API.
 * @returns {string} - The full image URL.
 */
export function getImageUrl(url) {
    if (!url) return '/images/default.png';
    if (url.startsWith('http') || url.startsWith('/images/') || url.startsWith('/assets/')) return url;

    // Strip /api suffix to get the host base (e.g. http://localhost:8080)
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const hostBase = apiBase.split('/api')[0];
    return `${hostBase}${url}`;
}
