package com.atelie.ecommerce.api.catalog.product;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.Size;

/**
 * DTO para receber os dados de criação de produto.
 * Garante que recebemos o ID da categoria separadamente para validação.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ProductCreateRequest(
                @JsonProperty("title") String name,
                String description,
                BigDecimal price,
                BigDecimal originalPrice,
                @JsonProperty("stock") Integer stockQuantity,
                @JsonProperty("category") UUID categoryId,
                List<ProductMediaItem> media,
                List<ProductVariantRequest> variants,
                Boolean active,
                BigDecimal weight,
                BigDecimal height,
                BigDecimal width,
                BigDecimal length,
                @JsonProperty("marketplaceIds") List<UUID> marketplaceIds,
                @Size(min = 8, max = 8, message = "O NCM deve ter exatamente 8 dígitos", groups = {
                }) String ncm,
                com.atelie.ecommerce.domain.catalog.product.ProductionType productionType,
                com.atelie.ecommerce.domain.catalog.product.ProductOrigin origin){
        public record ProductMediaItem(String url, String type, Boolean isMain) {
        }

        public record ProductVariantRequest(UUID id, String sku, BigDecimal price, BigDecimal originalPrice,
                        Integer stock,
                        java.util.Map<String, String> attributes, String imageUrl, List<ProductMediaItem> media) {
        }
}
