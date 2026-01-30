package com.atelie.ecommerce.domain.provider;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Collections;

public record RouteContext(
        String country,
        String cep,
        BigDecimal cartTotal,
        Map<String, Object> attributes // <--- O Pulo do Gato: Acesso total aos dados
) {
    public RouteContext {
        if (attributes == null) attributes = Collections.emptyMap();
    }
}
