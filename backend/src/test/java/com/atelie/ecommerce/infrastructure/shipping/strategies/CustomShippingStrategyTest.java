package com.atelie.ecommerce.infrastructure.shipping.strategies;

import com.atelie.ecommerce.domain.service.port.ServiceProviderConfigGateway;
import com.atelie.ecommerce.domain.shipping.strategy.ShippingStrategy;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderEntity;
import com.atelie.ecommerce.infrastructure.persistence.shipping.CustomShippingRegionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomShippingStrategyTest {

    @Mock
    private ServiceProviderJpaRepository providerRepository;

    @Mock
    private CustomShippingRegionRepository regionRepository;

    @Mock
    private ServiceProviderConfigGateway configGateway;

    private ObjectMapper objectMapper;

    @InjectMocks
    private CustomShippingStrategy strategy;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        strategy = new CustomShippingStrategy(providerRepository, regionRepository, configGateway, objectMapper);
    }

    @Test
    void shouldCalculateShippingWithDynamicDataFromJson() {
        // Arrange
        String providerName = "CUSTOM_LOCAL";
        UUID providerId = UUID.randomUUID();
        String destinationCep = "09961-000";
        String cleanCep = "09961000";

        ServiceProviderEntity provider = ServiceProviderEntity.builder()
                .id(providerId)
                .code(providerName)
                .driverKey("shipping.custom")
                .build();

        when(providerRepository.findByCode(providerName)).thenReturn(Optional.of(provider));
        when(regionRepository.existsByProviderIdAndCep(providerId, cleanCep)).thenReturn(true);

        String configJson = "{\"days\": \"2\", \"name\": \"J3 Flex\", \"price\": \"15.00\"}";
        when(configGateway.findConfigJson(providerName, "PRODUCTION")).thenReturn(Optional.of(configJson));

        ShippingStrategy.ShippingParams params = new ShippingStrategy.ShippingParams(
                destinationCep, BigDecimal.ZERO, List.of(), "tenant", providerName);

        // Act
        ShippingStrategy.ShippingResult result = strategy.calculate(params);

        // Assert
        assertTrue(result.success());
        assertEquals("J3 Flex", result.providerName());
        assertEquals(new BigDecimal("15.00"), result.cost());
        assertEquals("2", result.estimatedDays());
    }

    @Test
    void shouldReturnFailureIfCepNotCovered() {
        // Arrange
        String providerName = "CUSTOM_LOCAL";
        UUID providerId = UUID.randomUUID();
        String destinationCep = "99999-999";

        ServiceProviderEntity provider = ServiceProviderEntity.builder()
                .id(providerId)
                .code(providerName)
                .build();

        when(providerRepository.findByCode(providerName)).thenReturn(Optional.of(provider));
        when(regionRepository.existsByProviderIdAndCep(any(), anyString())).thenReturn(false);

        ShippingStrategy.ShippingParams params = new ShippingStrategy.ShippingParams(
                destinationCep, BigDecimal.ZERO, List.of(), "tenant", providerName);

        // Act
        ShippingStrategy.ShippingResult result = strategy.calculate(params);

        // Assert
        assertFalse(result.success());
        assertEquals("O CEP informado não é atendido por esta transportadora.", result.error());
    }
}
