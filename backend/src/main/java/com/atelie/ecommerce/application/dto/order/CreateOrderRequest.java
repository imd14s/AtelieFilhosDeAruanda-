package com.atelie.ecommerce.application.dto.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank; // Importante!
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateOrderRequest(
        @NotBlank(message = "Source é obrigatório") String source,

        @NotBlank(message = "External ID é obrigatório") String externalId,

        @NotBlank(message = "Nome do cliente é obrigatório") String customerName,

        @NotBlank(message = "E-mail do cliente é obrigatório") String customerEmail,

        @NotEmpty(message = "Lista de itens não pode ser vazia") @Valid List<CreateOrderItemRequest> items,

        @NotBlank(message = "Documento do cliente (CPF/CNPJ) é obrigatório para fins fiscais") @Size(min = 11, max = 14, message = "Documento inválido. Deve ter entre 11 (CPF) e 14 (CNPJ) caracteres.") String customerDocument,

        String shippingStreet,
        String shippingNumber,
        String shippingComplement,
        String shippingNeighborhood,
        String shippingCity,
        String shippingState,
        String shippingZipCode,
        java.math.BigDecimal shippingCost,
        String shippingProvider) {
}