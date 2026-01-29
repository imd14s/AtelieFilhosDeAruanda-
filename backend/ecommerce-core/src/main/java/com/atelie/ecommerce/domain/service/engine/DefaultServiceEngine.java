package com.atelie.ecommerce.domain.service.engine;

import com.atelie.ecommerce.domain.provider.RouteContext;
import com.atelie.ecommerce.domain.provider.RuleMatch;
import com.atelie.ecommerce.domain.provider.RuleMatcher;
import com.atelie.ecommerce.domain.service.model.ServiceProvider;
import com.atelie.ecommerce.domain.service.model.ServiceRoutingRule;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.domain.service.port.ServiceRoutingRuleGateway;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public class DefaultServiceEngine implements ServiceEngine {

    private final ServiceProviderGateway providerGateway;
    private final ServiceRoutingRuleGateway routingRuleGateway;
    private final RuleMatcher ruleMatcher;

    public DefaultServiceEngine(
            ServiceProviderGateway providerGateway,
            ServiceRoutingRuleGateway routingRuleGateway,
            RuleMatcher ruleMatcher
    ) {
        this.providerGateway = providerGateway;
        this.routingRuleGateway = routingRuleGateway;
        this.ruleMatcher = ruleMatcher;
    }

    @Override
    public ResolvedProvider resolve(ServiceType type, ServiceContext ctx) {
        List<ServiceProvider> providers = providerGateway.findEnabledByTypeOrdered(type);
        if (providers == null || providers.isEmpty()) {
            throw new IllegalStateException("No enabled providers for service type: " + type);
        }

        List<ServiceRoutingRule> rules = routingRuleGateway.findEnabledByTypeOrdered(type);
        RouteContext routeCtx = toRouteContext(ctx); // Adapter

        if (rules != null && !rules.isEmpty()) {
            for (ServiceRoutingRule rule : rules) {
                RuleMatch match = ruleMatcher.matches(routeCtx, rule.matchJson());
                if (match.matched()) {
                    String providerCode = rule.providerCode();
                    Optional<ServiceProvider> byCode = providerGateway.findByCode(type, providerCode);
                    if (byCode.isPresent() && byCode.get().enabled()) {
                        return new ResolvedProvider(byCode.get(), "RULE_MATCH: " + match.reason());
                    }
                }
            }
        }
        return new ResolvedProvider(providers.get(0), "DEFAULT_PRIORITY");
    }

    private RouteContext toRouteContext(ServiceContext ctx) {
        String cep = (String) ctx.attributes().getOrDefault("cep", "");
        
        // Mantém a lógica de fallback se ctx.orderTotal() vier zero (embora Orchestrator agora garanta)
        BigDecimal total = ctx.orderTotal();
        if ((total == null || total.compareTo(BigDecimal.ZERO) == 0) && ctx.attributes().containsKey("subtotal")) {
             Object sub = ctx.attributes().get("subtotal");
             if (sub instanceof BigDecimal) total = (BigDecimal) sub;
        }

        return new RouteContext(
            ctx.country() != null ? ctx.country() : "BR",
            cep,
            total,
            ctx.attributes() // <--- Passando o mapa completo!
        );
    }
}
