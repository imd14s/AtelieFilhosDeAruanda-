import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    keywords?: string;
    twitterCard?: "summary" | "summary_large_image" | "app" | "player";
}

/**
 * Componente SEO para gerenciar metadados da página de forma centralizada.
 * Suporta Open Graph, Twitter Cards e injeção SSR via Backend.
 */
const SEO: React.FC<SEOProps> = ({
    title,
    description = "Descubra a magia do Ateliê Filhos de Aruanda. Velas, Guias, Ervas e artigos artesanais feitos com axé e devoção.",
    image = "/og-image.jpg",
    url = window.location.href,
    type = "website",
    keywords = "artigos religiosos, umbanda, candomblé, velas artesanais, guias de proteção",
    twitterCard = "summary_large_image"
}) => {
    const siteName = "Ateliê Filhos de Aruanda";
    const fullTitle = title ? (title.includes(siteName) ? title : `${title} | ${siteName}`) : siteName;

    return (
        <Helmet>
            {/* Títulos e Meta Tags Básicas */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Acessibilidade e Social */}
            <meta name="robots" content="index, follow" />
        </Helmet>
    );
};

export default SEO;
