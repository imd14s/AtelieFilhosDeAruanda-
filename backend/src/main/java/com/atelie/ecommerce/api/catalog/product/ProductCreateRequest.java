package com.atelie.ecommerce.api.catalog.product;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * DTO para receber os dados de criação de produto.
 * Garante que recebemos o ID da categoria separadamente para validação.
 */
public record ProductCreateRequest(
    String name,
    String description,
    BigDecimal price,
    Integer stockQuantity,
    UUID categoryId,
    List<String> images
) {}
