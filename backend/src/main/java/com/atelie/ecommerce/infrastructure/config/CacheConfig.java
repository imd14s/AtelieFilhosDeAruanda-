package com.atelie.ecommerce.infrastructure.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

/**
 * Habilita o suporte a @Cacheable, @CacheEvict e @CachePut.
 * O provider Caffeine é configurado no application.yml.
 */
@Configuration
@EnableCaching
public class CacheConfig {
}
