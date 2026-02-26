package com.atelie.ecommerce.domain.shipping.model;

/**
 * Estados normalizados de rastreio para o ecossistema Ateliê Filhos de Aruanda.
 * Traduz os diversos status das transportadoras para o domínio da aplicação.
 */
public enum TrackingStatus {
    PENDING, // Objeto aguardando postagem
    POSTED, // Objeto postado na transportadora
    EN_ROUTE, // Objeto em movimentação entre unidades ou em rota de entrega
    DELIVERED, // Objeto entregue ao destinatário final
    FAILURE, // Problema grave (Extravio, Avaria, Destinatário não encontrado após
             // tentativas)
    CANCELED // Rastreio cancelado pela transportadora ou lojista
}
