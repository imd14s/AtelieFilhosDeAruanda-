package com.atelie.ecommerce.domain.config;

import java.util.List;

/**
 * SystemConfigGateway.
 *
 * Porta do domínio para acesso às configurações do sistema.
 * A infraestrutura (JPA, cache, etc.) implementa esta interface.
 */
public interface SystemConfigGateway {

    /**
     * Lista todas as configurações disponíveis.
     *
     * @return lista de SystemConfig
     */
    List<SystemConfig> findAll();
}
