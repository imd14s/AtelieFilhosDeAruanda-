package com.atelie.ecommerce.domain.shipping.rules;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ShippingRuleTrigger(
        BigDecimal cartTotalMin,
        BigDecimal cartTotalMax,
        Integer minItemsCount,
        List<String> validZipCodePrefixes, // Exemplos: "01", "02" para SP capital. List vazia = todos.
        List<String> validStates, // "SP", "RJ". List vazia = todos.
        List<UUID> validCategoryIds // Regra aplicada somente se o carrinho contiver ALGUM item desta categoria
) {
    public ShippingRuleTrigger {
        if (validZipCodePrefixes == null)
            validZipCodePrefixes = List.of();
        if (validStates == null)
            validStates = List.of();
        if (validCategoryIds == null)
            validCategoryIds = List.of();
    }
}
