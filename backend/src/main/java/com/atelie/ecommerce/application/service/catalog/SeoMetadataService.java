package com.atelie.ecommerce.application.service.catalog;

import com.atelie.ecommerce.application.service.catalog.dto.SeoMetadataDTO;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.category.CategoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SeoMetadataService {

        private final ProductRepository productRepository;
        private final CategoryRepository categoryRepository;

        @Value("${app.frontend.url:https://ateliefilhosdearuanda.com.br}")
        private String baseUrl;

        private static final String SITE_NAME = "Ateliê Filhos de Aruanda";

        public Optional<SeoMetadataDTO> getProductSeo(String idOrSlug) {
                return productRepository.findBySlug(idOrSlug)
                                .map(this::generateForProduct)
                                .or(() -> {
                                        try {
                                                UUID id = UUID.fromString(idOrSlug);
                                                return productRepository.findById(id).map(this::generateForProduct);
                                        } catch (IllegalArgumentException e) {
                                                return Optional.empty();
                                        }
                                });
        }

        public Optional<SeoMetadataDTO> getCategorySeo(UUID id) {
                return categoryRepository.findById(id).map(this::generateForCategory);
        }

        public SeoMetadataDTO generateForProduct(ProductEntity product) {
                String name = product.getName();
                String categoryName = product.getCategory() != null ? product.getCategory().getName()
                                : "Artigos Religiosos";
                String canonicalUrl = baseUrl + "/produto/"
                                + (product.getSlug() != null ? product.getSlug() : product.getId());

                // Título de cauda longa: [Produto] | Guia de Proteção X - Ateliê Filhos de
                // Aruanda
                String title = String.format("%s | %s - %s", name, categoryName, SITE_NAME);

                // Description com gatilho de conversão
                String rawDescription = product.getDescription() != null ? product.getDescription() : "";
                String cleanDescription = rawDescription.length() > 150 ? rawDescription.substring(0, 147) + "..."
                                : rawDescription;
                String priceInfo = product.getPrice() != null ? " por apenas R$ " + product.getPrice() : "";
                String description = String.format(
                                "%s. Compre seu %s%s no Ateliê Filhos de Aruanda. Entrega rápida e axé garantido!",
                                cleanDescription, name, priceInfo);

                String jsonLd = generateProductJsonLd(product, canonicalUrl);

                return SeoMetadataDTO.builder()
                                .title(title)
                                .description(description)
                                .canonicalUrl(canonicalUrl)
                                .ogTitle(title)
                                .ogDescription(description)
                                .ogImage(product.getImageUrl())
                                .ogType("product")
                                .twitterCard("summary_large_image")
                                .jsonLd(jsonLd)
                                .build();
        }

        public SeoMetadataDTO generateForCategory(CategoryEntity category) {
                String name = category.getName();
                String title = String.format("Artigos para %s | %s", name, SITE_NAME);
                String description = String.format(
                                "Confira nossa seleção exclusiva de artigos para %s. Velas, Guias, Ervas e tudo o que você precisa com a qualidade do %s.",
                                name, SITE_NAME);
                String canonicalUrl = baseUrl + "/categoria/" + category.getId();

                String jsonLd = generateCategoryJsonLd(category, canonicalUrl);

                return SeoMetadataDTO.builder()
                                .title(title)
                                .description(description)
                                .canonicalUrl(canonicalUrl) // Ajustar se tiver slug de
                                                            // categoria no
                                                            // futuro
                                .ogTitle(title)
                                .ogDescription(description)
                                .ogType("website")
                                .twitterCard("summary")
                                .jsonLd(jsonLd)
                                .build();
        }

        private String generateProductJsonLd(ProductEntity product, String canonicalUrl) {
                String categoryName = product.getCategory() != null ? product.getCategory().getName() : "Produtos";
                String imageUrl = product.getImageUrl();
                if (imageUrl != null && !imageUrl.startsWith("http")) {
                        imageUrl = baseUrl + imageUrl;
                }

                return String.format(
                                "{" +
                                                "\"@context\": \"https://schema.org\"," +
                                                "\"@type\": \"Product\"," +
                                                "\"name\": \"%s\"," +
                                                "\"image\": \"%s\"," +
                                                "\"description\": \"%s\"," +
                                                "\"sku\": \"%s\"," +
                                                "\"brand\": { \"@type\": \"Brand\", \"name\": \"%s\" }," +
                                                "\"offers\": {" +
                                                "\"@type\": \"Offer\"," +
                                                "\"url\": \"%s\"," +
                                                "\"priceCurrency\": \"BRL\"," +
                                                "\"price\": \"%s\"," +
                                                "\"itemCondition\": \"https://schema.org/NewCondition\"," +
                                                "\"availability\": \"%s\"" +
                                                "}" +
                                                "}",
                                escapeJson(product.getName()),
                                imageUrl,
                                escapeJson(product.getDescription() != null ? product.getDescription() : ""),
                                product.getId(),
                                SITE_NAME,
                                canonicalUrl,
                                product.getPrice() != null ? product.getPrice().toString() : "0.00",
                                (product.getStockQuantity() != null && product.getStockQuantity() > 0)
                                                ? "https://schema.org/InStock"
                                                : "https://schema.org/OutOfStock");
        }

        private String generateCategoryJsonLd(CategoryEntity category, String canonicalUrl) {
                return String.format(
                                "{" +
                                                "\"@context\": \"https://schema.org\"," +
                                                "\"@type\": \"BreadcrumbList\"," +
                                                "\"itemListElement\": [" +
                                                "{ \"@type\": \"ListItem\", \"position\": 1, \"name\": \"Home\", \"item\": \"%s\" },"
                                                +
                                                "{ \"@type\": \"ListItem\", \"position\": 2, \"name\": \"%s\", \"item\": \"%s\" }"
                                                +
                                                "]" +
                                                "}",
                                baseUrl,
                                escapeJson(category.getName()),
                                canonicalUrl);
        }

        private String escapeJson(String input) {
                if (input == null)
                        return "";
                return input.replace("\"", "\\\"").replace("\n", " ").replace("\r", " ");
        }

        public SeoMetadataDTO generateDefault() {
                String title = SITE_NAME + " - Velas, Guias e Artigos Religiosos";
                String description = "O Ateliê Filhos de Aruanda oferece os melhores artigos religiosos artesanais. Velas, Guias, Cristais e muito mais feitos com amor e devoção.";

                return SeoMetadataDTO.builder()
                                .title(title)
                                .description(description)
                                .canonicalUrl(baseUrl)
                                .ogTitle(title)
                                .ogDescription(description)
                                .ogImage(baseUrl + "/og-image.jpg")
                                .ogType("website")
                                .twitterCard("summary_large_image")
                                .build();
        }
}
