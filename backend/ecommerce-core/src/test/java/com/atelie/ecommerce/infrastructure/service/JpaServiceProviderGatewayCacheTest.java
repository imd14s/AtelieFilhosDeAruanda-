package com.atelie.ecommerce.infrastructure.service;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderEntity;
import org.junit.jupiter.api.Test;

import java.time.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class JpaServiceProviderGatewayCacheTest {

    @Test
    void shouldUseCacheWithinTtlAndReloadAfterTtl() {
        ServiceProviderJpaRepository repo = mock(ServiceProviderJpaRepository.class);
        DynamicConfigService cfg = mock(DynamicConfigService.class);

        // TTL de 2s
        when(cfg.getLong(eq(DynamicConfigService.CACHE_TTL_SECONDS_KEY), anyLong())).thenReturn(2L);

        ServiceProviderEntity e = new ServiceProviderEntity();
        e.setId(UUID.randomUUID());
        e.setServiceType("SHIPPING");
        e.setCode("J3");
        e.setName("J3");
        e.setEnabled(true);
        e.setPriority(1);
        e.setDriverKey("j3");
        e.setHealthEnabled(true);

        when(repo.findByServiceTypeAndEnabledOrderByPriorityAsc("SHIPPING", true))
                .thenReturn(List.of(e));

        Instant base = Instant.parse("2026-01-01T00:00:00Z");
        Clock fixed = Clock.fixed(base, ZoneOffset.UTC);

        JpaServiceProviderGateway gw = new JpaServiceProviderGateway(repo, cfg, fixed);

        // 1) Primeira chamada: bate no repo
        gw.findEnabledByTypeOrdered(ServiceType.SHIPPING);
        // 2) Segunda chamada (mesmo clock): deve vir do cache
        gw.findEnabledByTypeOrdered(ServiceType.SHIPPING);

        verify(repo, times(1))
                .findByServiceTypeAndEnabledOrderByPriorityAsc("SHIPPING", true);

        // 3) Avança o tempo além do TTL (3s) e chama de novo => reload
        Clock after = Clock.fixed(base.plusSeconds(3), ZoneOffset.UTC);
        JpaServiceProviderGateway gw2 = new JpaServiceProviderGateway(repo, cfg, after);

        gw2.refresh(); // simula o mesmo bean tendo avançado o tempo no mundo real
        gw2.findEnabledByTypeOrdered(ServiceType.SHIPPING);

        verify(repo, times(2))
                .findByServiceTypeAndEnabledOrderByPriorityAsc("SHIPPING", true);
    }

    @Test
    void shouldCacheFindByCode() {
        ServiceProviderJpaRepository repo = mock(ServiceProviderJpaRepository.class);
        DynamicConfigService cfg = mock(DynamicConfigService.class);
        when(cfg.getLong(eq(DynamicConfigService.CACHE_TTL_SECONDS_KEY), anyLong())).thenReturn(300L);

        ServiceProviderEntity e = new ServiceProviderEntity();
        e.setId(UUID.randomUUID());
        e.setServiceType("SHIPPING");
        e.setCode("J3");
        e.setName("J3");
        e.setEnabled(true);
        e.setPriority(1);
        e.setDriverKey("j3");
        e.setHealthEnabled(true);

        when(repo.findByCode("J3")).thenReturn(Optional.of(e));

        Clock clock = Clock.fixed(Instant.parse("2026-01-01T00:00:00Z"), ZoneOffset.UTC);
        JpaServiceProviderGateway gw = new JpaServiceProviderGateway(repo, cfg, clock);

        gw.findByCode(ServiceType.SHIPPING, "J3");
        gw.findByCode(ServiceType.SHIPPING, "J3");

        verify(repo, times(1)).findByCode("J3");
        assertEquals("J3", gw.findByCode(ServiceType.SHIPPING, "J3").orElseThrow().code());
    }
}
