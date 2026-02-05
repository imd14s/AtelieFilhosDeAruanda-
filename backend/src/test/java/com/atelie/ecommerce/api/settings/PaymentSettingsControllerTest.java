package com.atelie.ecommerce.api.settings;

import com.atelie.ecommerce.domain.payment.model.PaymentProvider;
import com.atelie.ecommerce.infrastructure.persistence.payment.PaymentProviderRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class PaymentSettingsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PaymentProviderRepository repository;

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    void getAll_ShouldReturnList() throws Exception {
        when(repository.findAll()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/settings/payment"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    void update_ShouldUpdateProvider() throws Exception {
        UUID id = UUID.randomUUID();
        PaymentProvider initial = new PaymentProvider();
        initial.setId(id);
        initial.setName("Initial Payment");
        initial.setEnabled(false);
        // Avoid setting config/installments if it causes H2 issues for now, or keep it
        // to reproduce
        initial.setConfig(Map.of("k", "v"));

        when(repository.findById(id)).thenReturn(java.util.Optional.of(initial));
        when(repository.save(any(PaymentProvider.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentProvider provider = new PaymentProvider();
        provider.setId(id); // ID is ignored in PUT path usually but payload might have it
        provider.setName("Mercado Pago");
        provider.setEnabled(true);
        provider.setConfig(Map.of("publicKey", "PK-123"));

        mockMvc.perform(put("/api/settings/payment/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(provider)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Mercado Pago")));
    }
}
