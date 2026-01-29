package com.atelie.ecommerce.domain.service.engine;

import com.atelie.ecommerce.domain.provider.RuleMatcher;
import com.atelie.ecommerce.domain.service.model.ServiceProvider;
import com.atelie.ecommerce.domain.service.model.ServiceRoutingRule;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.domain.service.port.ServiceRoutingRuleGateway;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class DefaultServiceEngineTest {

    // Instância real do RuleMatcher (lógica pura, sem mock necessário)
    private final RuleMatcher ruleMatcher = new RuleMatcher();

    @Test
    void shouldPickHighestPriorityEnabledProvider_whenNoRulesMatch() {
        // providers: J3 prio=10, CORREIOS prio=20 (menor = mais prioritário)
        ServiceProvider j3 = new ServiceProvider(UUID.randomUUID(), ServiceType.SHIPPING, "J3", "J3", true, 10, "shipping.j3", true);
        ServiceProvider correios = new ServiceProvider(UUID.randomUUID(), ServiceType.SHIPPING, "CORREIOS", "Correios", true, 20, "shipping.correios", true);

        ServiceProviderGateway providerGateway = new InMemoryProviderGateway(List.of(j3, correios));
        ServiceRoutingRuleGateway ruleGateway = new InMemoryRuleGateway(List.of()); // sem regras

        // CORREÇÃO: Passando ruleMatcher (3º argumento)
        DefaultServiceEngine engine = new DefaultServiceEngine(providerGateway, ruleGateway, ruleMatcher);
        ServiceContext ctx = new ServiceContext("BR", BigDecimal.valueOf(100), Map.of());

        ResolvedProvider resolved = engine.resolve(ServiceType.SHIPPING, ctx);

        assertEquals("J3", resolved.provider().code());
        assertTrue(resolved.reason().toLowerCase().contains("default") || resolved.reason().toLowerCase().contains("priority"));
    }

    @Test
    void shouldPickProviderByRuleMatch_whenRuleIsEnabledAndMatches() {
        ServiceProvider j3 = new ServiceProvider(UUID.randomUUID(), ServiceType.SHIPPING, "J3", "J3", true, 10, "shipping.j3", true);
        ServiceProvider correios = new ServiceProvider(UUID.randomUUID(), ServiceType.SHIPPING, "CORREIOS", "Correios", true, 20, "shipping.correios", true);
        
        // regra manda usar CORREIOS quando country=BR
        ServiceRoutingRule rule = new ServiceRoutingRule(
                UUID.randomUUID(),
                ServiceType.SHIPPING,
                "CORREIOS",
                true,
                1,
                "{\"country\":\"BR\"}",
                "{}"
        );

        ServiceProviderGateway providerGateway = new InMemoryProviderGateway(List.of(j3, correios));
        ServiceRoutingRuleGateway ruleGateway = new InMemoryRuleGateway(List.of(rule));

        // CORREÇÃO: Passando ruleMatcher (3º argumento)
        DefaultServiceEngine engine = new DefaultServiceEngine(providerGateway, ruleGateway, ruleMatcher);
        ServiceContext ctx = new ServiceContext("BR", BigDecimal.valueOf(100), Map.of());

        ResolvedProvider resolved = engine.resolve(ServiceType.SHIPPING, ctx);

        assertEquals("CORREIOS", resolved.provider().code());
        assertTrue(resolved.reason().toLowerCase().contains("rule"));
    }

    @Test
    void shouldThrow_whenNoEnabledProvidersExist() {
        ServiceProviderGateway providerGateway = new InMemoryProviderGateway(List.of());
        // nenhum provider
        ServiceRoutingRuleGateway ruleGateway = new InMemoryRuleGateway(List.of());
        
        // CORREÇÃO: Passando ruleMatcher (3º argumento)
        DefaultServiceEngine engine = new DefaultServiceEngine(providerGateway, ruleGateway, ruleMatcher);

        ServiceContext ctx = new ServiceContext("BR", BigDecimal.valueOf(100), Map.of());

        assertThrows(IllegalStateException.class, () -> engine.resolve(ServiceType.SHIPPING, ctx));
    }

    // ===== fakes in-memory =====

    static class InMemoryProviderGateway implements ServiceProviderGateway {
        private final List<ServiceProvider> data;
        InMemoryProviderGateway(List<ServiceProvider> data) { this.data = data; }

        @Override
        public void refresh() {}

        @Override
        public List<ServiceProvider> findEnabledByTypeOrdered(ServiceType type) {
            return data.stream()
                    .filter(p -> p.serviceType() == type)
                    .filter(ServiceProvider::enabled)
                    .sorted(Comparator.comparingInt(ServiceProvider::priority))
                    .toList();
        }

        @Override
        public Optional<ServiceProvider> findByCode(ServiceType type, String code) {
            return data.stream()
                    .filter(p -> p.serviceType() == type)
                    .filter(p -> p.code().equalsIgnoreCase(code))
                    .findFirst();
        }
    }

    static class InMemoryRuleGateway implements ServiceRoutingRuleGateway {
        private final List<ServiceRoutingRule> data;
        InMemoryRuleGateway(List<ServiceRoutingRule> data) { this.data = data; }
        
        @Override
        public void refresh() {}

        @Override
        public List<ServiceRoutingRule> findEnabledByTypeOrdered(ServiceType type) {
            return data.stream()
                    .filter(r -> r.serviceType() == type)
                    .filter(ServiceRoutingRule::enabled)
                    .sorted(Comparator.comparingInt(ServiceRoutingRule::priority))
                    .toList();
        }
    }
}
