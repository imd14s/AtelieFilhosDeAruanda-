package com.atelie.ecommerce.application.service.fiscal.ncm;

import com.atelie.ecommerce.domain.common.pagination.PageResult;
import com.atelie.ecommerce.domain.fiscal.ncm.Ncm;
import com.atelie.ecommerce.domain.fiscal.ncm.NcmRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NcmServiceTest {

    @Mock
    private NcmRepository ncmRepository;

    @InjectMocks
    private NcmService ncmService;

    @Test
    void shouldReturnEmptyPageWhenQueryIsBlank() {
        PageResult<Ncm> result = ncmService.searchNcms("   ", 0, 20);

        assertThat(result.content()).isEmpty();
        verifyNoInteractions(ncmRepository);
    }

    @Test
    void shouldCallRepositoryWithPagination() {
        Ncm ncm = new Ncm("84716052", "Teclado");
        PageResult<Ncm> expectedPage = new PageResult<>(List.of(ncm), 1L, 1, 0, 20);

        when(ncmRepository.findAllByQuery("teclado", 0, 20)).thenReturn(expectedPage);

        PageResult<Ncm> result = ncmService.searchNcms("teclado", 0, 20);

        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0).code()).isEqualTo("84716052");
        verify(ncmRepository).findAllByQuery("teclado", 0, 20);
    }
}
