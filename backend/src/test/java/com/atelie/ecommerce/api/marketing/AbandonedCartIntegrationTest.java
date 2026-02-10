package com.atelie.ecommerce.api.marketing;

import com.atelie.ecommerce.domain.marketing.model.AbandonedCartConfig;
import com.atelie.ecommerce.infrastructure.persistence.marketing.AbandonedCartConfigRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AbandonedCartIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AbandonedCartConfigRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getConfig_ShouldReturnEmptyTriggers_WhenNoConfigExists() throws Exception {
        mockMvc.perform(get("/api/marketing/abandoned-carts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false))
                .andExpect(jsonPath("$.triggers", notNullValue()))
                .andExpect(jsonPath("$.triggers", hasSize(0)));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getConfig_ShouldReturnEmptyTriggers_WhenConfigExistsWithNullTriggers() throws Exception {
        AbandonedCartConfig config = AbandonedCartConfig.builder()
                .enabled(true)
                .triggers(null) // Simulate null triggers in DB
                .build();
        repository.save(config);

        mockMvc.perform(get("/api/marketing/abandoned-carts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(true))
                .andExpect(jsonPath("$.triggers", notNullValue()))
                .andExpect(jsonPath("$.triggers", hasSize(0)));
    }
}
