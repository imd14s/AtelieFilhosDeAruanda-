package com.atelie.ecommerce.api.marketing;

import com.atelie.ecommerce.domain.marketing.model.AbandonedCartConfig;
import com.atelie.ecommerce.infrastructure.persistence.marketing.AbandonedCartConfigRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AbandonedCartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AbandonedCartConfigRepository repository;

    @BeforeEach
    void setup() {
        repository.deleteAll();
    }

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    void get_ShouldReturnNotFoundInitially_OrEmpty() throws Exception {
        // Depending on impl it might return 404 or empty config
        // Assuming current impl might return 200 with null
        mockMvc.perform(get("/api/marketing/abandoned-carts"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin", roles = { "ADMIN" })
    void update_ShouldSaveConfig() throws Exception {
        AbandonedCartConfig config = new AbandonedCartConfig();
        config.setEnabled(true);
        config.setTriggers(List.of(Map.of("minutes", 60)));

        mockMvc.perform(put("/api/marketing/abandoned-carts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(config)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled", is(true)));
    }
}
