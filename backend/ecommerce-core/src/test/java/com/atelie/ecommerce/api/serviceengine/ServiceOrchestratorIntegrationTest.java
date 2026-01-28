package com.atelie.ecommerce.api.serviceengine;

import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderConfigJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceRoutingRuleJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderConfigEntity;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ServiceOrchestratorIntegrationTest {

    private final ServiceOrchestrator orchestrator;
    private final ServiceProviderJpaRepository providerRepo;
    private final ServiceProviderConfigJpaRepository configRepo;
    private final ServiceRoutingRuleJpaRepository ruleRepo;

    ServiceOrchestratorIntegrationTest(
            ServiceOrchestrator orchestrator,
            ServiceProviderJpaRepository providerRepo,
            ServiceProviderConfigJpaRepository configRepo,
            ServiceRoutingRuleJpaRepository ruleRepo
    ) {
        this.orchestrator = orchestrator;
        this.providerRepo = providerRepo;
        this.configRepo = configRepo;
        this.ruleRepo = ruleRepo;
    }

    @BeforeEach
    void setup() {
        ruleRepo.deleteAll();
        configRepo.deleteAll();
        providerRepo.deleteAll();

        ServiceProviderEntity provider = new ServiceProviderEntity();
        provider.setId(UUID.randomUUID());
        provider.setServiceType("SHIPPING");
        provider.setCode("J3");
        provider.setName("J3 Transportadora");
        provider.setDriverKey("shipping.j3");
        provider.setEnabled(true);
        provider.setPriority(1);
        provider.setHealthEnabled(false);

        providerRepo.save(provider);

        ServiceProviderConfigEntity cfg = new ServiceProviderConfigEntity();
        cfg.setId(UUID.randomUUID());
        cfg.setProviderCode("J3");
        cfg.setEnvironment("prod");
        cfg.setConfigJson("{\"rate\":13.00}");
        cfg.setVersion(1);

        configRepo.save(cfg);
    }

    @Test
    void shouldChangeBehaviorOnlyByChangingDatabase() {

        ServiceResult result1 = orchestrator.execute(
                ServiceType.SHIPPING,
                Map.of("zip", "01001000"),
                "prod"
        );

        assertTrue(result1.success());
        assertEquals(13.0,
                ((Number) result1.payload().get("usedRate")).doubleValue()
        );

        // muda apenas o banco
        ServiceProviderConfigEntity cfg = configRepo.findAll().get(0);
        cfg.setConfigJson("{\"rate\":15.00}");
        configRepo.save(cfg);

        ServiceResult result2 = orchestrator.execute(
                ServiceType.SHIPPING,
                Map.of("zip", "01001000"),
                "prod"
        );

        assertEquals(15.0,
                ((Number) result2.payload().get("usedRate")).doubleValue()
        );
    }
}
