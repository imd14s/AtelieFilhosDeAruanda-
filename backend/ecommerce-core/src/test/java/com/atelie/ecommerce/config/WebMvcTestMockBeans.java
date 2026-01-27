package com.atelie.ecommerce.config;

import com.atelie.ecommerce.infrastructure.persistence.inventory.InventoryRepository;
import org.mockito.Mockito;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

/**
 * WebMvcTestMockBeans
 * Fornece mocks para dependências que não existem em slice tests (@WebMvcTest),
 * como repositories (JPA não sobe nesse tipo de teste).
 */
@TestConfiguration
public class WebMvcTestMockBeans {

    @Bean
    public InventoryRepository inventoryRepository() {
        return Mockito.mock(InventoryRepository.class);
    }
}
