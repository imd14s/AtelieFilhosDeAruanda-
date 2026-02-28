package com.atelie.ecommerce.infrastructure.shipping.strategies;

import com.atelie.ecommerce.domain.service.port.ServiceProviderConfigGateway;
import com.atelie.ecommerce.domain.shipping.strategy.ShippingStrategy.ShippingParams;
import com.atelie.ecommerce.domain.shipping.strategy.ShippingStrategy.ShippingResult;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CustomShippingStrategyTest {

    @Mock
    private ServiceProviderJpaRepository providerRepository;

    @Mock
    private CustomShippingRegionRepository regionRepository;

    @Mock
    private ServiceProviderConfigGateway configGateway;

    private ObjectMapper objectMapper = new ObjectMapper();

    private CustomShippingStrategy strategy;

    @BeforeEach
    void setUp() {
        strategy = new CustomShippingStrategy(providerRepository, regionRepository, configGateway, objectMapper);
    }

    @Test
    void shouldSupportCustomProvider() {
        ServiceProviderEntity provider = new ServiceProviderEntity();
        provider.setDriverKey("shipping.custom");

        when(providerRepository.findByCode("CUSTOM_LOCAL")).thenReturn(Optional.of(provider));

        assertTrue(strategy.supports("CUSTOM_LOCAL"));
    }

    @Test
    void shouldNotSupportOtherProvider() {
        ServiceProviderEntity provider = new ServiceProviderEntity();
        provider.setDriverKey("shipping.melhorenvio");

        when(providerRepository.findByCode("MELHOR_ENVIO")).thenReturn(Optional.of(provider));

        assertFalse(strategy.supports("MELHOR_ENVIO"));
    }

    @Test
    void shouldCalculateSuccessfullyWhenCepIsCovered() {
        UUID providerId = UUID.randomUUID();
        ServiceProviderEntity provider = new ServiceProviderEntity();
        provider.setId(providerId);

        ShippingParams params = new ShippingParams("01001-000", BigDecimal.TEN, List.of(), "tenant", "CUSTOM_LOCAL");

        when(providerRepository.findByCode("CUSTOM_LOCAL")).thenReturn(Optional.of(provider));
        when(regionRepository.existsByProviderIdAndCep(providerId, "01001000")).thenReturn(true);
        when(configGateway.findConfigJson("CUSTOM_LOCAL", "PRODUCTION"))
                .thenReturn(Optional.of("{\"price\": 15.50, \"days\": 2}"));

        ShippingResult result = strategy.calculate(params);

        assertTrue(result.success());
        assertEquals(0, new BigDecimal("15.50").compareTo(result.cost()));
        assertEquals("2", result.estimatedDays());
    }

    @Test
    void shouldReturnFailureWhenCepIsNotCovered() {
        UUID providerId = UUID.randomUUID();
        ServiceProviderEntity provider = new ServiceProviderEntity();
        provider.setId(providerId);

        ShippingParams params = new ShippingParams("99999-999", BigDecimal.TEN, List.of(), "tenant", "CUSTOM_LOCAL");

        when(providerRepository.findByCode("CUSTOM_LOCAL")).thenReturn(Optional.of(provider));
        when(regionRepository.existsByProviderIdAndCep(providerId, "99999999")).thenReturn(false);

        ShippingResult result = strategy.calculate(params);

        assertFalse(result.success());
        assertEquals("O CEP informado não é atendido por esta transportadora.", result.error());
    }
}
