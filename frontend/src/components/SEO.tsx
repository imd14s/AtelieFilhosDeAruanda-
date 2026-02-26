import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
}

/**
 * Componente SEO para gerenciar metadados da página de forma centralizada.
 */
const SEO: React.FC<SEOProps> = ({
    title,
    description = "Descubra a magia do Ateliê Filhos de Aruanda. Velas, Guias, Ervas e artigos artesanais feitos com axé e devoção.",
    image = "/og-image.jpg",
    url = "https://ateliefilhosdearuanda.com.br",
    type = "website"
}) => {
    const siteName = "Ateliê Filhos de Aruanda";
    const fullTitle = title ? `${title} | ${siteName}` : siteName;

    return (
        <Helmet>
            {/* Títulos e Meta Tags Básicas */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Acessibilidade e Social */}
            <meta name="robots" content="index, follow" />
        </Helmet>
    );
};

export default SEO;
