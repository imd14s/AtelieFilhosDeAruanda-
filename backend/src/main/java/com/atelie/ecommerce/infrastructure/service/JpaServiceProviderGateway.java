package com.atelie.ecommerce.infrastructure.service;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import com.atelie.ecommerce.domain.service.model.ServiceProvider;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository;
import org.springframework.stereotype.Component;
import java.time.Clock;
import java.util.List;

@Component
public class JpaServiceProviderGateway extends BaseCachingGateway implements ServiceProviderGateway {
    private final ServiceProviderJpaRepository repository;

    public JpaServiceProviderGateway(ServiceProviderJpaRepository repository, DynamicConfigService configService, Clock clock) {
        super(configService, clock);
        this.repository = repository;
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<ServiceProvider> findEnabledByTypeOrdered(ServiceType type) {
        checkCache();
        return (List<ServiceProvider>) genericCache.computeIfAbsent("LIST_" + type, 
            k -> repository.findByServiceTypeAndEnabledOrderByPriorityAsc(type.name(), true)
                    .stream().map(e -> new ServiceProvider(e.getId(), e.getServiceType(), e.getCode(), e.getName(), e.getEnabled(), e.getPriority(), e.getDriverKey(), e.getHealthEnabled()))
                    .toList());
    }

    @Override
    public java.util.Optional<ServiceProvider> findByCode(ServiceType type, String code) {
        return repository.findByServiceTypeAndEnabledOrderByPriorityAsc(type.name(), true)
                .stream()
                .filter(e -> e.getCode().equalsIgnoreCase(code))
                .findFirst()
                .map(e -> new ServiceProvider(
                    e.getId(), 
                    ServiceType.valueOf(e.getServiceType()), 
                    e.getCode(), 
                    e.getName(), 
                    e.isEnabled(), 
                    e.getPriority(), 
                    e.getDriverKey(), 
                    e.isHealthEnabled()
                ));
    }
}
