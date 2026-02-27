package com.atelie.ecommerce.api.admin;

import com.atelie.ecommerce.infrastructure.service.BaseCachingGateway;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class GeneralAdminIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        // Mocking gateways to prevent cache errors during refresh calls
        @MockBean(name = "serviceProviderConfigGateway")
        private BaseCachingGateway serviceProviderConfigGateway;

        @Test
        @WithMockUser(roles = "ADMIN")
        void cacheRefresh_ShouldReturnOk() throws Exception {
                mockMvc.perform(post("/api/admin/cache/refresh"))
                                .andExpect(status().isOk());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        void adminConfig_Crud_ShouldWork() throws Exception {
                // List - initially empty or default
                mockMvc.perform(get("/api/admin/configs"))
                                .andExpect(status().isOk());

                // Upsert
                Map<String, String> config = Map.of(
                                "configKey", "TEST_KEY",
                                "configValue", "TEST_VALUE",
                                "configJson", "{}");

                mockMvc.perform(post("/api/admin/configs")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(config)))
                                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                                .andExpect(status().isOk());

                // Delete
                mockMvc.perform(delete("/api/admin/configs/TEST_KEY"))
                                .andExpect(status().isNoContent());
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        void featureFlags_Crud_ShouldWork() throws Exception {
                // List
                mockMvc.perform(get("/api/admin/features"))
                                .andExpect(status().isOk());

                // Create/Update
                Map<String, Object> feature = Map.of(
                                "flagKey", "NEW_FEATURE",
                                "enabled", true,
                                "valueJson", "{}");

                mockMvc.perform(post("/api/admin/features")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(feature)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.flagKey").value("NEW_FEATURE"))
                                .andExpect(jsonPath("$.enabled").value(true));
        }

        @Test
        @WithMockUser(roles = "USER")
        void adminRoutes_AsUser_ShouldReturnForbidden() throws Exception {
                mockMvc.perform(get("/api/admin/configs"))
                                .andExpect(status().isForbidden());

                mockMvc.perform(post("/api/admin/cache/refresh"))
                                .andExpect(status().isForbidden());
        }

        @Test
        void adminRoutes_Unauthenticated_ShouldReturnUnauthorized() throws Exception {
                mockMvc.perform(get("/api/admin/configs"))
                                .andExpect(status().isUnauthorized());
        }
}
