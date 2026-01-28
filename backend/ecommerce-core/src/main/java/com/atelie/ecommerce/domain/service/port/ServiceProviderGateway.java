package com.atelie.ecommerce.domain.service.port;

import com.atelie.ecommerce.domain.service.ServiceType;
import com.atelie.ecommerce.domain.service.model.ServiceProvider;

import java.util.List;

/**
 * Porta para buscar providers (DB/Dashboard).
 */
@FunctionalInterface
public interface ServiceProviderGateway {
    List<ServiceProvider> findByServiceType(ServiceType serviceType);
}
