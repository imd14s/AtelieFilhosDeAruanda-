package com.atelie.ecommerce.domain.service.engine;

import com.atelie.ecommerce.domain.service.model.ServiceProvider;
import com.atelie.ecommerce.domain.service.model.ServiceRoutingRule;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.domain.service.port.ServiceRoutingRuleGateway;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Optional;
import java.util.Locale;

public class DefaultServiceEngine implements ServiceEngine {

    private final ServiceProviderGateway providerGateway;
    private final ServiceRoutingRuleGateway routingRuleGateway;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public DefaultServiceEngine(
            ServiceProviderGateway providerGateway,
            ServiceRoutingRuleGateway routingRuleGateway
    ) {
        this.providerGateway = providerGateway;
        this.routingRuleGateway = routingRuleGateway;
    }

    @Override
    public ResolvedProvider resolve(ServiceType type, ServiceContext ctx) {
        List<ServiceProvider> providers = providerGateway.findEnabledByTypeOrdered(type);
        if (providers == null || providers.isEmpty()) {
            throw new IllegalStateException("No enabled providers for service type: " + type);
        }

        List<ServiceRoutingRule> rules = routingRuleGateway.findEnabledByTypeOrdered(type);
        
        // 1) Tentativa por regras dinâmicas
        if (rules != null && !rules.isEmpty()) {
            for (ServiceRoutingRule rule : rules) {
                if (matches(rule, ctx)) {
                    String providerCode = rule.providerCode();
                    Optional<ServiceProvider> byCode = providerGateway.findByCode(type, providerCode);
                    if (byCode.isPresent() && byCode.get().enabled()) {
                        return new ResolvedProvider(byCode.get(), "RULE_MATCH");
                    }
                }
            }
        }

        // 2) Fallback: Prioridade padrão
        return new ResolvedProvider(providers.get(0), "DEFAULT_PRIORITY");
    }

    private boolean matches(ServiceRoutingRule rule, ServiceContext ctx) {
        if (rule == null || !rule.enabled()) return false;
        String conditions = rule.matchJson();
        if (conditions == null || conditions.isBlank()) return false;

        try {
            JsonNode root = objectMapper.readTree(conditions);
            
            // Exemplo de implementação robusta: Country Check
            if (root.has("country")) {
                String ruleCountry = root.get("country").asText();
                String ctxCountry = ctx.country() != null ? ctx.country() : "";
                if (!ruleCountry.equalsIgnoreCase(ctxCountry)) {
                    return false;
                }
            }
            
            // Aqui você pode expandir para outras regras (total do pedido, canal de venda, etc)
            // sem depender de formatação de string.
            
            return true;
        } catch (Exception e) {
            System.err.println("Erro ao processar regra JSON: " + e.getMessage());
            return false;
        }
    }
}
