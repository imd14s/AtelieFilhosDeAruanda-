package com.atelie.ecommerce.domain.service.engine;

import com.atelie.ecommerce.domain.service.model.ServiceProvider;
import com.atelie.ecommerce.domain.service.model.ServiceRoutingRule;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.domain.service.port.ServiceRoutingRuleGateway;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

public class DefaultServiceEngine implements ServiceEngine {

    private final ServiceProviderGateway providerGateway;
    private final ServiceRoutingRuleGateway routingRuleGateway;

    public DefaultServiceEngine(
            ServiceProviderGateway providerGateway,
            ServiceRoutingRuleGateway routingRuleGateway
    ) {
        this.providerGateway = providerGateway;
        this.routingRuleGateway = routingRuleGateway;
    }

    @Override
    public ResolvedProvider resolve(ServiceType type, ServiceContext ctx) {

        List<ServiceProvider> providers =
                providerGateway.findEnabledByTypeOrdered(type);

        if (providers == null || providers.isEmpty()) {
            throw new IllegalStateException("No enabled providers for service type: " + type);
        }

        List<ServiceRoutingRule> rules =
                routingRuleGateway.findEnabledByTypeOrdered(type);

        // 1) Tenta resolver por regra (em ordem de prioridade do gateway)
        if (rules != null && !rules.isEmpty()) {
            for (ServiceRoutingRule rule : rules) {
                if (matches(rule, ctx)) {
                    String providerCode = rule.providerCode();
                    Optional<ServiceProvider> byCode = providerGateway.findByCode(type, providerCode);
                    if (byCode.isPresent() && byCode.get().enabled()) {
                        return new ResolvedProvider(byCode.get(), "RULE_MATCH");
                    }
                    // regra bateu, mas provider não existe/está desabilitado => erro de configuração
                    throw new IllegalStateException("Rule matched but provider not available/enabled: " + providerCode);
                }
            }
        }

        // 2) Fallback: maior prioridade (menor número) já vem ordenado pelo gateway
        return new ResolvedProvider(providers.get(0), "DEFAULT_PRIORITY");
    }

    /**
     * Matcher minimalista só para o cenário atual de testes.
     * Suporta condição {"country":"BR"} no JSON de conditions.
     * (Depois evoluímos para matcher real e sem string parsing frágil.)
     */
    private boolean matches(ServiceRoutingRule rule, ServiceContext ctx) {
        if (rule == null || !rule.enabled()) return false;

        String conditions = rule.matchJson();
        if (conditions == null || conditions.isBlank()) return false;

        String normalized = conditions.toLowerCase(Locale.ROOT).replaceAll("\\s+", "");

        // suporta: {"country":"BR"} (case-insensitive)
        if (normalized.contains("\"country\"")) {
            String ctxCountry = ctx.country() == null ? "" : ctx.country().trim();
            return normalized.contains("\"country\":\"" + ctxCountry.toLowerCase(Locale.ROOT) + "\"");
        }

        return false;
    }
}
