package com.atelie.ecommerce.api.admin;

import com.atelie.ecommerce.domain.service.port.ServiceProviderConfigGateway;
import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceProviderConfigJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceProviderConfigEntity;
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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AdminProviderConfigIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ServiceProviderConfigJpaRepository repository;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ServiceProviderConfigGateway gateway;

    private UUID providerId;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
        providerId = UUID.randomUUID(); // Assuming no FK constraint for this test as per entity definition or using H2
                                        // loose constraints
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void upsertConfig_ShouldCreateNewVersion() throws Exception {
        // 1. Initial Insert
        ServiceProviderConfigEntity config1 = new ServiceProviderConfigEntity();
        config1.setProviderId(providerId);
        config1.setEnvironment("PROD");
        config1.setConfigJson("{\"apiKey\": \"123\"}");

        mockMvc.perform(post("/api/admin/provider-configs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(config1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.configJson").value("{\"apiKey\": \"123\"}"));

        verify(gateway).refresh(); // Verify cache flush

        // 2. Update (Upsert) - Should increment version
        ServiceProviderConfigEntity config2 = new ServiceProviderConfigEntity();
        config2.setProviderId(providerId);
        config2.setEnvironment("PROD");
        config2.setConfigJson("{\"apiKey\": \"456\"}");

        mockMvc.perform(post("/api/admin/provider-configs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(config2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(2))
                .andExpect(jsonPath("$.configJson").value("{\"apiKey\": \"456\"}"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getConfig_ShouldReturnLatestVersion() throws Exception {
        // Setup: Insert version 1 and 2 directly
        ServiceProviderConfigEntity v1 = new ServiceProviderConfigEntity();
        v1.setId(UUID.randomUUID());
        v1.setProviderId(providerId);
        v1.setEnvironment("TEST");
        v1.setConfigJson("{\"v\": 1}");
        v1.setVersion(1);
        v1.setUpdatedAt(LocalDateTime.now().minusHours(1));
        repository.save(v1);

        ServiceProviderConfigEntity v2 = new ServiceProviderConfigEntity();
        v2.setId(UUID.randomUUID());
        v2.setProviderId(providerId);
        v2.setEnvironment("TEST");
        v2.setConfigJson("{\"v\": 2}");
        v2.setVersion(2);
        v2.setUpdatedAt(LocalDateTime.now());
        repository.save(v2);

        // Act & Assert
        mockMvc.perform(get("/api/admin/provider-configs/{providerId}/{env}", providerId, "TEST"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(2))
                .andExpect(jsonPath("$.configJson").value("{\"v\": 2}"));
    }
}
