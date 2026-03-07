package com.atelie.ecommerce.api.marketing;

import com.atelie.ecommerce.domain.marketing.model.NewsletterSubscriber;
import com.atelie.ecommerce.infrastructure.persistence.marketing.NewsletterSubscriberRepository;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailQueueRepository;
import com.atelie.ecommerce.domain.marketing.model.AutomationType;
import com.atelie.ecommerce.domain.marketing.model.EmailTemplate;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailTemplateRepository;
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

    @Autowired
    private EmailTemplateRepository emailTemplateRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        emailQueueRepository.deleteAll();
        repository.deleteAll();
        emailTemplateRepository.deleteAll();
        userRepository.deleteAll();

        // Seed a user
        UserEntity user = new UserEntity();
        user.setEmail("test@example.com");
        user.setName("Test User");
        user.setPassword("password");
        userRepository.save(user);

        // Seed a template
        EmailTemplate template = EmailTemplate.builder()
                .slug("NEWSLETTER_CONFIRM")
                .name("Newsletter Confirmation")
                .subject("Bem-vindo!")
                .content("Obrigado por se inscrever, {{name}}!")
                .automationType(AutomationType.NEWSLETTER_CONFIRM)
                .isActive(true)
                .build();
        emailTemplateRepository.save(template);
    }

    @Test
    @org.springframework.security.test.context.support.WithMockUser(username = "test@example.com", roles = "USER")
    void shouldSubscribe_AuthenticatedUser() throws Exception {
        mockMvc.perform(post("/api/newsletter/subscribe"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value("Assinatura realizada com sucesso! Você receberá nossas novidades por e-mail."));

        Optional<NewsletterSubscriber> subscriber = repository.findByEmail("test@example.com");
        assertThat(subscriber).isPresent();
        assertThat(subscriber.get().getActive()).isTrue();

        assertThat(emailQueueRepository.count()).isEqualTo(1);
    }

    @Test
    void shouldReturnUnauthorized_AnonymousUser() throws Exception {
        mockMvc.perform(post("/api/newsletter/subscribe"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Você precisa estar logado para assinar a newsletter."));
    }
}
