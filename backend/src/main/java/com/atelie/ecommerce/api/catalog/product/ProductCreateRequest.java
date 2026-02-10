package com.atelie.ecommerce.api.catalog.product;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * DTO para receber os dados de criação de produto.
 * Garante que recebemos o ID da categoria separadamente para validação.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record ProductCreateRequest(
        @JsonProperty("title") String name,
        String description,
        BigDecimal price,
        @JsonProperty("stock") Integer stockQuantity,
        @JsonProperty("category") UUID categoryId,
        List<ProductMediaItem> media,
        Boolean active) {
    public record ProductMediaItem(String url, String type, Boolean isMain) {
    }
}
