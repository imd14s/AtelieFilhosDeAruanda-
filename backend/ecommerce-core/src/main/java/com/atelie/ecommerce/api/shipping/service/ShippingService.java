package com.atelie.ecommerce.api.shipping.service;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import com.atelie.ecommerce.api.shipping.dto.ShippingQuoteResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.stream.Stream;

@Service
public class ShippingService {

    private final DynamicConfigService config;

    public ShippingService(DynamicConfigService config) {
        this.config = config;
    }

    public ShippingQuoteResponse quote(String rawCep, BigDecimal subtotal, String forcedProvider) {
        String cep = normalizeCep(rawCep);

        String provider = (forcedProvider != null && !forcedProvider.isBlank())
                ? forcedProvider.trim().toUpperCase()
                : config.requireString("SHIPPING_PROVIDER_MODE").trim().toUpperCase();

        return switch (provider) {
            case "J3" -> quoteJ3(cep, subtotal);
            case "FLAT_RATE" -> quoteFlat(cep, subtotal);
            default -> throw new IllegalStateException("SHIPPING_PROVIDER_MODE inválido: " + provider);
        };
    }

    private ShippingQuoteResponse quoteJ3(String cep, BigDecimal subtotal) {
        boolean eligible = isCepEligibleByPrefixes(cep, config.requireString("J3_CEP_PREFIXES"));
        BigDecimal threshold = config.requireBigDecimal("J3_FREE_SHIPPING_THRESHOLD");
        BigDecimal rate = config.requireBigDecimal("J3_RATE");

        if (!eligible) {
            // Se não é atendido pelo J3, não inventamos regra: retornamos não elegível e custo = rate (ou 0).
            // Aqui mantemos custo = rate como padrão "frete pago", mas você pode ajustar depois via config/roteamento.
            boolean free = subtotal.compareTo(threshold) >= 0;
            BigDecimal cost = free ? BigDecimal.ZERO : rate;
            return new ShippingQuoteResponse("J3", false, free, cost, threshold);
        }

        boolean free = subtotal.compareTo(threshold) >= 0;
        BigDecimal cost = free ? BigDecimal.ZERO : rate;
        return new ShippingQuoteResponse("J3", true, free, cost, threshold);
    }

    private ShippingQuoteResponse quoteFlat(String cep, BigDecimal subtotal) {
        BigDecimal threshold = config.requireBigDecimal("FLAT_FREE_SHIPPING_THRESHOLD");
        BigDecimal rate = config.requireBigDecimal("FLAT_RATE");

        boolean free = subtotal.compareTo(threshold) >= 0;
        BigDecimal cost = free ? BigDecimal.ZERO : rate;
        return new ShippingQuoteResponse("FLAT_RATE", true, free, cost, threshold);
    }

    private String normalizeCep(String cep) {
        if (cep == null) return "";
        String digits = cep.replaceAll("\\D+", "");
        // mantém 8 dígitos se vier completo; se vier menor, ainda funcionará por prefixo
        return digits;
    }

    private boolean isCepEligibleByPrefixes(String cepDigits, String prefixesCsv) {
        String csv = (prefixesCsv == null) ? "" : prefixesCsv.trim();
        if (csv.isEmpty()) return true; // Sem lista = não bloqueia (governável via DB: pode colocar prefixos)
        Stream<String> prefixes = Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty());

        return prefixes.anyMatch(prefix -> cepDigits.startsWith(prefix));
    }
}
