package com.atelie.ecommerce.api.marketing;

import com.atelie.ecommerce.domain.marketing.model.NewsletterSubscriber;
import com.atelie.ecommerce.infrastructure.persistence.marketing.NewsletterSubscriberRepository;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailQueueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class NewsletterControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NewsletterSubscriberRepository repository;

    @Autowired
    private EmailQueueRepository emailQueueRepository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
        emailQueueRepository.deleteAll();
    }

    @Test
    void shouldSubscribe_ValidEmail() throws Exception {
        String json = "{\"email\": \"test@example.com\"}";

        mockMvc.perform(post("/api/newsletter/subscribe")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Inscrição realizada! Verifique seu e-mail para confirmar."));

        Optional<NewsletterSubscriber> subscriber = repository.findByEmail("test@example.com");
        assertThat(subscriber).isPresent();
        assertThat(subscriber.get().getActive()).isTrue();

        assertThat(emailQueueRepository.count()).isEqualTo(1);
    }

    @Test
    void shouldReturnBadRequest_InvalidEmail() throws Exception {
        String json = "{\"email\": \"invalid-email\"}";

        mockMvc.perform(post("/api/newsletter/subscribe")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("E-mail inválido"));
    }
}
