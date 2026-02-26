package com.atelie.ecommerce.api.fiscal.ncm;

import com.atelie.ecommerce.application.service.fiscal.ncm.NcmService;
import com.atelie.ecommerce.application.service.fiscal.ncm.NcmSyncService;
import com.atelie.ecommerce.domain.common.pagination.PageResult;
import com.atelie.ecommerce.domain.fiscal.ncm.Ncm;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = NcmController.class)
@AutoConfigureMockMvc(addFilters = false) // Ignore security setup for pure controller test
class NcmControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NcmService ncmService;

    @MockBean
    private NcmSyncService ncmSyncService;

    @MockBean
    private com.atelie.ecommerce.infrastructure.security.TokenProvider tokenProvider;

    @MockBean
    private com.atelie.ecommerce.infrastructure.security.CustomUserDetailsService customUserDetailsService;

    @Test
    void shouldReturnPaginatedResults() throws Exception {
        Ncm ncm = new Ncm("8471", "Teste");
        PageResult<Ncm> page = new PageResult<>(List.of(ncm), 1L, 1, 0, 20);

        when(ncmService.searchNcms("test", 0, 20)).thenReturn(page);

        mockMvc.perform(get("/api/fiscal/ncm")
                .param("query", "test")
                .param("page", "0")
                .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].code").value("8471"))
                .andExpect(jsonPath("$.content[0].description").value("Teste"))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1));
    }

    @Test
    void shouldTriggerSync() throws Exception {
        doNothing().when(ncmSyncService).synchronizeNcms();

        mockMvc.perform(post("/api/fiscal/ncm/sync"))
                .andExpect(status().isNoContent());

        verify(ncmSyncService).synchronizeNcms();
    }
}
