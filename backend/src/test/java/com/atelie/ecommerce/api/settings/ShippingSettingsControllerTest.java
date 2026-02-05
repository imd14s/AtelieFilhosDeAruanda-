package com.atelie.ecommerce.api.settings;

import com.atelie.ecommerce.domain.shipping.model.ShippingProvider;
import com.atelie.ecommerce.infrastructure.persistence.shipping.ShippingProviderRepository;
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

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ShippingSettingsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ShippingProviderRepository repository;

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    void getAll_ShouldReturnEmptyListInitially() throws Exception {
        when(repository.findAll()).thenReturn(java.util.Collections.emptyList());

        mockMvc.perform(get("/api/settings/shipping"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    void update_ShouldUpdateExistingProvider() throws Exception {
        UUID id = UUID.randomUUID();
        ShippingProvider initial = new ShippingProvider();
        initial.setId(id);
        initial.setName("Initial Name");
        initial.setEnabled(false);
        initial.setConfig(Map.of("key", "val"));

        // Mock repository behavior
        when(repository.findById(id)).thenReturn(java.util.Optional.of(initial));
        when(repository.save(any(ShippingProvider.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ShippingProvider updatePayload = new ShippingProvider();
        updatePayload.setName("Correios");
        updatePayload.setEnabled(true);
        updatePayload.setConfig(Map.of("token", "123"));

        mockMvc.perform(put("/api/settings/shipping/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatePayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Correios")))
                .andExpect(jsonPath("$.enabled", is(true)));
    }

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    void toggle_ShouldUpdateEnabledStatus() throws Exception {
        UUID id = UUID.randomUUID();
        ShippingProvider provider = new ShippingProvider();
        provider.setId(id);
        provider.setName("Loggi");
        provider.setEnabled(true); // Initial state is enabled, we will toggle to disabled

        when(repository.findById(id)).thenReturn(java.util.Optional.of(provider));
        when(repository.save(any(ShippingProvider.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Boolean> payload = Map.of("enabled", false);

        mockMvc.perform(patch("/api/settings/shipping/" + id + "/toggle")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled", is(false)));
    }
}
