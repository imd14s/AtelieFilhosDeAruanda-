package com.atelie.ecommerce.domain.marketing.model;

import lombok.Getter;

@Getter
public enum AutomationType {
    NEWSLETTER_CONFIRM("Confirmação de inscrição na newsletter."),
    USER_VERIFY("Verificação de conta de novo usuário."),
    ORDER_CONFIRM("Confirmação de recebimento de novo pedido."),
    PASSWORD_RESET("Recuperação de acesso e troca de senha."),
    PRODUCT_PRICE_DROP("Notificação de baixa de preço de produto favoritado."),
    CAMPAIGN("Disparo de campanhas de marketing manuais.");

    private final String description;

    AutomationType(String description) {
        this.description = description;
    }
}
