package com.atelie.ecommerce.domain.service.port;

import com.atelie.ecommerce.domain.service.model.ServiceProvider;
import com.atelie.ecommerce.domain.service.model.ServiceType;

import java.util.List;
import java.util.Optional;

public interface ServiceProviderGateway {
    List<ServiceProvider> findEnabledByTypeOrdered(ServiceType type);
    Optional<ServiceProvider> findByCode(ServiceType type, String code);
}
