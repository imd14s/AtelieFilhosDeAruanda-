package com.atelie.ecommerce.infrastructure.shipping.strategies;

import com.atelie.ecommerce.domain.service.port.ServiceProviderConfigGateway;
import com.atelie.ecommerce.domain.shipping.strategy.ShippingStrategy;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.shipping.CustomShippingRegionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class CustomShippingStrategy implements ShippingStrategy {

    private final ServiceProviderJpaRepository providerRepository;
    private final CustomShippingRegionRepository regionRepository;
    private final ServiceProviderConfigGateway configGateway;
    private final ObjectMapper objectMapper;

    public CustomShippingStrategy(
            ServiceProviderJpaRepository providerRepository,
            CustomShippingRegionRepository regionRepository,
            ServiceProviderConfigGateway configGateway,
            ObjectMapper objectMapper) {
        this.providerRepository = providerRepository;
        this.regionRepository = regionRepository;
        this.configGateway = configGateway;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean supports(String providerName) {
        if (providerName == null || providerName.isEmpty())
            return false;

        // Em um cenário real com múltiplos customizados com códigos diferentes
        // Eles compartilharão a chave "shipping.custom"
        return providerRepository.findByCode(providerName)
                .map(p -> "shipping.custom".equals(p.getDriverKey()))
                .orElse(false);
    }

    @Override
    public ShippingResult calculate(ShippingParams params) {
        String providerName = params.providerName();
        var providerOpt = providerRepository.findByCode(providerName);

        if (providerOpt.isEmpty()) {
            return ShippingResult.failure(providerName, "Provedor customizado não encontrado no banco de dados.");
        }

        UUID providerId = providerOpt.get().getId();

        // 1. Validar se o CEP de destino existe no repositório de regiões customizadas
        String cleanCep = params.destinationCep().replaceAll("\\D", "");
        boolean isCovered = regionRepository.existsByProviderIdAndCep(providerId, cleanCep);

        if (!isCovered) {
            return ShippingResult.failure(providerName, "O CEP informado não é atendido por esta transportadora.");
        }

        // 2. Extrair preço e prazo da configuração
        BigDecimal finalPrice = BigDecimal.ZERO;
        String estimatedDays = "0";

        try {
            var configStrOpt = configGateway.findConfigJson(providerName, "PRODUCTION");
            if (configStrOpt.isPresent()) {
                JsonNode configNode = objectMapper.readTree(configStrOpt.get());
                if (configNode.has("price")) {
                    finalPrice = new BigDecimal(configNode.get("price").asText());
                }
                if (configNode.has("days")) {
                    estimatedDays = configNode.get("days").asText();
                }
            }
        } catch (Exception e) {
            return ShippingResult.failure(providerName, "Erro ao ler a configuração de preços do provedor.");
        }

        return new ShippingResult(
                providerName,
                true,
                true,
                finalPrice.compareTo(BigDecimal.ZERO) == 0,
                finalPrice, // cost
                BigDecimal.valueOf(9999), // threshold dummy
                estimatedDays,
                null,
                null, null, null);
    }
}
