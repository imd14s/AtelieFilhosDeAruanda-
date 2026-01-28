package com.atelie.ecommerce.infrastructure.service;

import com.atelie.ecommerce.domain.service.port.ServiceProviderConfigGateway;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderConfigJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class JpaServiceProviderConfigGateway implements ServiceProviderConfigGateway {

    private final ServiceProviderJpaRepository providerRepo;
    private final ServiceProviderConfigJpaRepository configRepo;

    public JpaServiceProviderConfigGateway(ServiceProviderJpaRepository providerRepo,
                                           ServiceProviderConfigJpaRepository configRepo) {
        this.providerRepo = providerRepo;
        this.configRepo = configRepo;
    }

    @Override
    public Optional<String> findConfigJson(String providerCode, String environment) {
        UUID providerId = providerRepo.findByCode(providerCode)
                .map(p -> p.getId())
                .orElse(null);

        if (providerId == null) return Optional.empty();

        return configRepo.findTopByProviderIdAndEnvironmentOrderByVersionDesc(providerId, environment)
                .map(c -> c.getConfigJson());
    }
}
