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

                return SeoMetadataDTO.builder()
                                .title(title)
                                .description(description)
                                .canonicalUrl(baseUrl + "/produto/"
                                                + (product.getSlug() != null ? product.getSlug() : product.getId()))
                                .ogTitle(title)
                                .ogDescription(description)
                                .ogImage(product.getImageUrl())
                                .ogType("product")
                                .twitterCard("summary_large_image")
                                .build();
        }

        public SeoMetadataDTO generateForCategory(CategoryEntity category) {
                String name = category.getName();
                String title = String.format("Artigos para %s | %s", name, SITE_NAME);
                String description = String.format(
                                "Confira nossa seleção exclusiva de artigos para %s. Velas, Guias, Ervas e tudo o que você precisa com a qualidade do %s.",
                                name, SITE_NAME);

                return SeoMetadataDTO.builder()
                                .title(title)
                                .description(description)
                                .canonicalUrl(baseUrl + "/categoria/" + category.getId()) // Ajustar se tiver slug de
                                                                                          // categoria no
                                                                                          // futuro
                                .ogTitle(title)
                                .ogDescription(description)
                                .ogType("website")
                                .twitterCard("summary")
                                .build();
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
