package com.atelie.ecommerce.application.service.fiscal.ncm;

import com.atelie.ecommerce.domain.fiscal.ncm.Ncm;
import com.atelie.ecommerce.domain.fiscal.ncm.NcmRepository;
import com.atelie.ecommerce.domain.fiscal.ncm.NcmSyncGateway;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NcmSyncServiceTest {

    @Mock
    private NcmSyncGateway syncGateway;

    @Mock
    private NcmRepository ncmRepository;

    @InjectMocks
    private NcmSyncService ncmSyncService;

    @Test
    void shouldSaveAllNcmsWhenGatewayReturnsData() {
        List<Ncm> fetched = List.of(new Ncm("123", "Test 1"), new Ncm("456", "Test 2"));
        when(syncGateway.fetchOfficialNcms()).thenReturn(fetched);

        ncmSyncService.synchronizeNcms();

        verify(ncmRepository).saveAll(fetched);
    }

    @Test
    void shouldNotSaveWhenGatewayReturnsEmpty() {
        when(syncGateway.fetchOfficialNcms()).thenReturn(List.of());

        ncmSyncService.synchronizeNcms();

        verify(ncmRepository, never()).saveAll(anyList());
    }
}
