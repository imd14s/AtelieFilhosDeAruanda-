package com.atelie.ecommerce.api.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank; // Importante!
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CreateOrderRequest(
    @NotBlank(message = "Source é obrigatório") 
    String source,
    
    @NotBlank(message = "External ID é obrigatório") 
    String externalId,
    
    @NotBlank(message = "Nome do cliente é obrigatório") 
    String customerName,
    
    @NotEmpty(message = "Lista de itens não pode ser vazia") 
    @Valid 
    List<CreateOrderItemRequest> items
) {}