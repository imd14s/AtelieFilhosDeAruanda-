import React, { useState } from 'react';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    width: number;
    height: number;
    priority?: boolean;
    productContext?: {
        name: string;
        category?: string;
    };
}

/**
 * Enhanced Image component for Web Performance and Accessibility.
 * - CLS prevention with explicit dimensions.
 * - Native lazy loading.
 * - Cloudinary format/quality optimization.
 * - Semantic alt generation.
 */
const OptimizedImage = React.forwardRef<HTMLImageElement, OptimizedImageProps>(({
    src,
    alt,
    width,
    height,
    priority = false,
    productContext,
    className = '',
    ...props
}, ref) => {
    const [error, setError] = useState(false);

    // Dynamic semantic alt: [Name] - [Category] - Ateliê Filhos de Aruanda
    const semanticAlt = productContext
        ? `${productContext.name}${productContext.category ? ` - ${productContext.category}` : ''} - Ateliê Filhos de Aruanda`
        : alt || 'Imagem Ateliê Filhos de Aruanda';

    const optimizedSrc = getOptimizedImageUrl(src, width, height);

    return (
        <img
            ref={ref}
            src={error ? '/images/default.png' : optimizedSrc}
            alt={semanticAlt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
            className={`transition-opacity duration-300 ${className}`}
            onError={() => setError(true)}
            {...props}
        />
    );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
