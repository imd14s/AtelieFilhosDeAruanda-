package com.atelie.ecommerce.api.catalog.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record CreateVariantRequest(
    @NotBlank(message = "SKU é obrigatório")
    String sku,
    
    String gtin, // Opcional (gera automático se nulo)
    
    BigDecimal price, // Opcional
    
    @NotNull
    @PositiveOrZero
    Integer initialStock,
    
    String attributesJson // JSON String: '{"tamanho": "M"}'
) {}
