package com.atelie.ecommerce.api.serviceengine;

import com.atelie.ecommerce.domain.service.model.ServiceProvider;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceRoutingRuleJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ServiceEngineWiringTest {

    private final ServiceEngine engine;
    private final ServiceProviderJpaRepository providerRepo;
    private final ServiceRoutingRuleJpaRepository ruleRepo;

    ServiceEngineWiringTest(ServiceEngine engine,
                            ServiceProviderJpaRepository providerRepo,
                            ServiceRoutingRuleJpaRepository ruleRepo) {
        this.engine = engine;
        this.providerRepo = providerRepo;
        this.ruleRepo = ruleRepo;
    }

    @BeforeEach
    void seedDb() {
        ruleRepo.deleteAll();
        providerRepo.deleteAll();

        ServiceProviderEntity p = new ServiceProviderEntity();
        p.setId(UUID.randomUUID());
        p.setServiceType("SHIPPING");
        p.setCode("J3");
        p.setDriverKey("shipping.j3");
        p.setName("J3 Transportadora");
        p.setEnabled(true);
        p.setHealthEnabled(false);
        p.setPriority(1);

        providerRepo.save(p);
    }

    @Test
    void shouldPickProviderFromDb() {
        Optional<ServiceProvider> picked = engine.pickProvider(ServiceType.SHIPPING);

        assertTrue(picked.isPresent());
        assertEquals("J3", picked.get().code());
    }
}
