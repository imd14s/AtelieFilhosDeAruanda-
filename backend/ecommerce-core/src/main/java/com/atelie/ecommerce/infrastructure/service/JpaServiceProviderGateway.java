package com.atelie.ecommerce.infrastructure.service;

import com.atelie.ecommerce.domain.service.model.ServiceProvider;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class JpaServiceProviderGateway implements ServiceProviderGateway {

    private final ServiceProviderJpaRepository repo;

    public JpaServiceProviderGateway(ServiceProviderJpaRepository repo) {
        this.repo = repo;
    }

    @Override
    public Optional<ServiceProvider> findByCode(ServiceType type, String code) {
        return repo.findByCode(code)
                .filter(e -> safeTypeEquals(type, e.getServiceType()))
                .map(this::toDomain);
    }

    // Se a sua port tiver esse método (é o padrão do erro atual / engine novo)
    @Override
    public List<ServiceProvider> findEnabledByTypeOrdered(ServiceType type) {
        return repo.findByServiceTypeAndEnabledOrderByPriorityAsc(type.name(), true)
                .stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    private ServiceProvider toDomain(ServiceProviderEntity e) {
        return new ServiceProvider(
                e.getId(),
                ServiceType.valueOf(e.getServiceType()),
                e.getCode(),
                e.getName(),
                e.isEnabled(),
                e.getPriority(),
                e.getDriverKey(),
                e.isHealthEnabled()
        );
    }

    private boolean safeTypeEquals(ServiceType expected, String raw) {
        if (raw == null) return false;
        try {
            return expected == ServiceType.valueOf(raw);
        } catch (IllegalArgumentException ex) {
            return false;
        }
    }
}
