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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
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
    void shouldProcessCsvSuccessfully() throws Exception {
        String csvData = "cep,outra_coluna\n12345678,ignorada\n01001-000,test\n\ninvalido";
        MultipartFile file = new MockMultipartFile("file", "test.csv", "text/csv",
                csvData.getBytes(StandardCharsets.UTF_8));

        service.processCsvUpload(providerId, file);

        verify(repository).deleteByProviderId(providerId);
        verify(repository).saveAll(listCaptor.capture());

        List<CustomShippingRegionEntity> saved = listCaptor.getValue();
        assertEquals(2, saved.size());
        assertEquals("12345678", saved.get(0).getCep());
        assertEquals("01001000", saved.get(1).getCep());
    }

    @Test
    void shouldThrowExceptionIfFileIsEmpty() {
        MultipartFile file = new MockMultipartFile("file", new byte[0]);

        assertThrows(IllegalArgumentException.class, () -> service.processCsvUpload(providerId, file));
        verifyNoInteractions(repository);
    }
}
