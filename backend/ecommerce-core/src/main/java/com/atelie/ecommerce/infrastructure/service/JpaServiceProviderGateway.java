package com.atelie.ecommerce.infrastructure.service;

import com.atelie.ecommerce.domain.service.ServiceType;
import com.atelie.ecommerce.domain.service.model.ServiceProvider;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class JpaServiceProviderGateway implements ServiceProviderGateway {

    private final ServiceProviderJpaRepository repo;

    public JpaServiceProviderGateway(ServiceProviderJpaRepository repo) {
        this.repo = repo;
    }

    @Override
    public List<ServiceProvider> findByServiceType(ServiceType serviceType) {
        return repo.findByServiceType(serviceType.name()).stream()
                .map(e -> new ServiceProvider(
                        e.getCode(),
                        e.getDriverKey(),
                        e.isEnabled(),
                        e.getPriority()
                ))
                .toList();
    }
}
