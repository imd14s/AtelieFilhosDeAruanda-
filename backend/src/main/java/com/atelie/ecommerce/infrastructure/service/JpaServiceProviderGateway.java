package com.atelie.ecommerce.infrastructure.service;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import com.atelie.ecommerce.domain.service.model.ServiceProvider;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.infrastructure.persistence.service.ServiceProviderRepository;
import org.springframework.stereotype.Component;
import java.time.Clock;
import java.util.List;

@Component
public class JpaServiceProviderGateway extends BaseCachingGateway implements ServiceProviderGateway {
    private final ServiceProviderRepository repository;

    public JpaServiceProviderGateway(ServiceProviderRepository repository, DynamicConfigService configService, Clock clock) {
        super(configService, clock);
        this.repository = repository;
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<ServiceProvider> findEnabledByTypeOrdered(ServiceType type) {
        checkCache();
        return (List<ServiceProvider>) genericCache.computeIfAbsent("LIST_" + type, 
            k -> repository.findByServiceTypeAndEnabledTrueOrderByPriorityAsc(type)
                    .stream().map(e -> new ServiceProvider(e.getId(), e.getServiceType(), e.getCode(), e.getName(), e.getEnabled(), e.getPriority(), e.getDriverKey(), e.getHealthEnabled()))
                    .toList());
    }
}
