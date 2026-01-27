package com.atelie.ecommerce.domain.inventory;

public enum MovementType {
    IN,      // Entrada (compra, devolução, ajuste)
    OUT,     // Saída (venda, perda, ajuste)
    RESERVED // Reservado (carrinho, aguardando pgto)
}
