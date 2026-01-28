package com.atelie.ecommerce.domain.service.port;

import java.util.Optional;

/**
 * Porta para buscar configs do provider (JSON + secrets refs) por ambiente.
 */
@FunctionalInterface
public interface ServiceProviderConfigGateway {
    Optional<String> findConfigJson(String providerCode, String environment);
}
