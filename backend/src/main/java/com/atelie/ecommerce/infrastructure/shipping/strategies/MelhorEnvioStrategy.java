package com.atelie.ecommerce.infrastructure.shipping.strategies;

import com.atelie.ecommerce.domain.shipping.strategy.ShippingStrategy;
import com.atelie.ecommerce.infrastructure.shipping.melhorenvio.MelhorEnvioClient;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class MelhorEnvioStrategy implements ShippingStrategy {

    private final MelhorEnvioClient client;

    public MelhorEnvioStrategy(MelhorEnvioClient client) {
        this.client = client;
    }

    @Override
    public boolean supports(String providerName) {
        return "MELHOR_ENVIO".equalsIgnoreCase(providerName);
    }

    @Override
    public ShippingResult calculate(ShippingParams params) {
        try {
            // Em uma implementação real, buscaríamos o token das configurações dinâmicas
            String token = "MOCK_TOKEN";

            Map<String, Object> payload = new HashMap<>();
            payload.put("from", "01001000"); // CEP de origem fixo ou da config
            payload.put("to", params.destinationCep());

            List<Map<String, Object>> products = params.items().stream()
                    .map(i -> {
                        Map<String, Object> p = new HashMap<>();
                        p.put("id", i.productId().toString());
                        p.put("quantity", i.quantity());
                        // Melhor Envio pede dimensões e peso
                        p.put("width", i.width() != null ? i.width() : 10);
                        p.put("height", i.height() != null ? i.height() : 10);
                        p.put("length", i.length() != null ? i.length() : 10);
                        p.put("weight", i.weight() != null ? i.weight() : 0.5);
                        return p;
                    })
                    .collect(Collectors.toList());

            payload.put("products", products);

            List<Map<String, Object>> options = client.calculate(token, payload);

            if (options == null || options.isEmpty()) {
                return ShippingResult.failure("MELHOR_ENVIO", "Nenhuma opção de frete retornada pela API.");
            }

            // Pega a primeira opção (ou a mais barata)
            Map<String, Object> bestOption = options.get(0);

            return new ShippingResult(
                    "MELHOR_ENVIO",
                    true,
                    true,
                    params.subtotal().compareTo(new BigDecimal("200")) >= 0, // Exemplo de regra de frete grátis
                    toBigDecimal(bestOption.get("price")),
                    new BigDecimal("200"),
                    bestOption.get("delivery_time") + " dias",
                    null);

        } catch (Exception e) {
            return ShippingResult.failure("MELHOR_ENVIO", "Erro na integração: " + e.getMessage());
        }
    }

    private BigDecimal toBigDecimal(Object val) {
        if (val == null)
            return BigDecimal.ZERO;
        if (val instanceof Number)
            return new BigDecimal(((Number) val).toString());
        return new BigDecimal(val.toString());
    }
}
