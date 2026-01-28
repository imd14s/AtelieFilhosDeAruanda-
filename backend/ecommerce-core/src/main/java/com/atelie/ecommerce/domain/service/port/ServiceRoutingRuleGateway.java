package com.atelie.ecommerce.domain.service.port;

import com.atelie.ecommerce.domain.service.ServiceType;

import java.util.List;

/**
 * Porta para buscar regras de roteamento (match/fallback/etc).
 * Vamos evoluir esse contrato depois, mantendo o motor.
 */
@FunctionalInterface
public interface ServiceRoutingRuleGateway {
    List<String> findRulesJson(ServiceType serviceType);
}
