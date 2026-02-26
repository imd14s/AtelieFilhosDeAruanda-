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
            // Simulação de cálculo volumétrico (Melhor Envio style)
            // Cubagem: (C x L x A) / 6000
            BigDecimal totalWeight = params.items().stream()
                    .map(i -> i.weight().multiply(BigDecimal.valueOf(i.quantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalVolume = params.items().stream()
                    .map(i -> i.length().multiply(i.width()).multiply(i.height())
                            .multiply(BigDecimal.valueOf(i.quantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal cubedWeight = totalVolume.divide(BigDecimal.valueOf(6000), 2, BigDecimal.ROUND_HALF_UP);
            BigDecimal finalWeight = totalWeight.max(cubedWeight);

            // Simulação de chamada externa
            if (params.destinationCep().startsWith("000")) {
                throw new RuntimeException("CEP inválido para simulação de erro.");
            }

            // Normalização de custo (Regra de exemplo)
            BigDecimal basePrice = BigDecimal.valueOf(15.0);
            BigDecimal weightPrice = finalWeight.multiply(BigDecimal.valueOf(2.5));
            BigDecimal finalPrice = basePrice.add(weightPrice);

            return new ShippingResult(
                    "MELHOR_ENVIO",
                    true,
                    true,
                    params.subtotal().compareTo(BigDecimal.valueOf(200)) >= 0,
                    new BigDecimal("25.50"), // cost fictício do mock
                    new BigDecimal("500.00"), // threshold fictício
                    "5", // estimatedDays fictício
                    null, // error
                    null, null, null // rules engine tracking fields
            );
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
