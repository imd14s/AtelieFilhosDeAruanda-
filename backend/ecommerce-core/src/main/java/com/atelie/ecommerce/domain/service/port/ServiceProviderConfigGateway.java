package com.atelie.ecommerce.domain.service.port;

import java.util.Optional;

public interface ServiceProviderConfigGateway {
    Optional<String> findConfigJson(String providerCode, String environment);
    
    // Novo contrato para invalidar cache
    void refresh();
}
