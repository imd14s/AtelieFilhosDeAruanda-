package com.atelie.ecommerce.application.service.shipping;

import com.atelie.ecommerce.infrastructure.persistence.shipping.CustomShippingRegionEntity;
import com.atelie.ecommerce.infrastructure.persistence.shipping.CustomShippingRegionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CustomShippingRegionServiceTest {

    @Mock
    private CustomShippingRegionRepository repository;

    @InjectMocks
    private CustomShippingRegionService service;

    @Captor
    private ArgumentCaptor<List<CustomShippingRegionEntity>> listCaptor;

    private UUID providerId;

    @BeforeEach
    void setUp() {
        providerId = UUID.randomUUID();
    }

    @Test
    void shouldProcessCepChunkSuccessfully() {
        List<String> chunk = List.of("12345678", "01001000", "invalido");

        service.processCepChunk(providerId, chunk);

        verify(repository).saveAll(listCaptor.capture());

        List<CustomShippingRegionEntity> saved = listCaptor.getValue();
        assertEquals(2, saved.size());
        assertEquals("12345678", saved.get(0).getCep());
        assertEquals("01001000", saved.get(1).getCep());
    }

    @Test
    void shouldNotSaveIfChunkIsEmpty() {
        service.processCepChunk(providerId, Collections.emptyList());
        verifyNoInteractions(repository);
    }
}
