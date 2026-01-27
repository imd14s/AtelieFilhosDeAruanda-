package com.atelie.ecommerce.domain.config;

/**
 * SystemConfig.
 *
 * Representa uma configuração do sistema no domínio.
 *
 * @param key chave única da configuração
 * @param value valor da configuração
 */
public record SystemConfig(String key, String value) {
}
