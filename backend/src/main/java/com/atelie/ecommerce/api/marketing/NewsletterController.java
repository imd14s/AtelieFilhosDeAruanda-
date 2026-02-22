package com.atelie.ecommerce.api.marketing;

import com.atelie.ecommerce.domain.marketing.model.AutomationType;
import com.atelie.ecommerce.domain.marketing.model.EmailQueue;
import com.atelie.ecommerce.domain.marketing.model.NewsletterSubscriber;
import com.atelie.ecommerce.application.service.marketing.CommunicationService;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailQueueRepository;
import com.atelie.ecommerce.infrastructure.persistence.marketing.NewsletterSubscriberRepository;
import com.atelie.ecommerce.api.config.DynamicConfigService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/newsletter")
public class NewsletterController {

    private static final Logger log = LoggerFactory.getLogger(NewsletterController.class);

    private final NewsletterSubscriberRepository subscriberRepository;
    private final EmailQueueRepository emailQueueRepository;
    private final DynamicConfigService configService;
    private final CommunicationService communicationService;

    public NewsletterController(NewsletterSubscriberRepository subscriberRepository,
            EmailQueueRepository emailQueueRepository,
            DynamicConfigService configService,
            CommunicationService communicationService) {
        this.subscriberRepository = subscriberRepository;
        this.emailQueueRepository = emailQueueRepository;
        this.configService = configService;
        this.communicationService = communicationService;
    }

    @PostMapping("/subscribe")
    @Transactional
    public ResponseEntity<?> subscribe(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || !email.contains("@")) {
            return ResponseEntity.badRequest().body(Map.of("message", "E-mail inválido"));
        }

        try {
            NewsletterSubscriber subscriber = subscriberRepository.findByEmail(email)
                    .orElse(NewsletterSubscriber.builder()
                            .email(email)
                            .active(true)
                            .emailVerified(true)
                            .verificationToken(UUID.randomUUID().toString())
                            .build());

            if (Boolean.TRUE.equals(subscriber.getEmailVerified()) && Boolean.TRUE.equals(subscriber.getActive())) {
                return ResponseEntity.ok(Map.of("message", "Você já está inscrito na nossa Newsletter!"));
            }

            subscriber.setEmailVerified(true);
            subscriber.setActive(true);
            subscriberRepository.save(subscriber);

            return ResponseEntity
                    .ok(Map.of("message", "Inscrição realizada com sucesso! Bem-vindo(a) à nossa Newsletter."));
        } catch (Exception e) {
            log.error("Error subscribing email {}: {}", email, e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("message", "Erro interno ao processar inscrição"));
        }
    }

    @PostMapping("/verify")
    @Transactional
    public ResponseEntity<?> verify(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token não fornecido."));
        }

        try {
            var subscriber = subscriberRepository.findByVerificationToken(token)
                    .orElse(null);

            if (subscriber == null) {
                return ResponseEntity.status(404).body(Map.of("message", "Token inválido ou expirado."));
            }

            if (Boolean.TRUE.equals(subscriber.getEmailVerified())) {
                return ResponseEntity.ok(Map.of("message", "E-mail já verificado anteriormente. Obrigado!"));
            }

            subscriber.setEmailVerified(true);
            subscriber.setActive(true);
            subscriberRepository.save(subscriber);

            return ResponseEntity.ok(Map.of("message", "Inscrição confirmada com sucesso! Bem-vindo(a) ao Ateliê."));
        } catch (Exception e) {
            log.error("Error verifying token {}: {}", token, e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("message", "Erro ao verificar inscrição."));
        }
    }

    @PostMapping("/unsubscribe")
    @Transactional
    public ResponseEntity<?> unsubscribe(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token não fornecido."));
        }

        try {
            var subscriber = subscriberRepository.findByVerificationToken(token)
                    .orElse(null);

            if (subscriber == null) {
                return ResponseEntity.status(404).body(Map.of("message", "Assinatura não encontrada."));
            }

            if (Boolean.FALSE.equals(subscriber.getActive())) {
                return ResponseEntity.ok(Map.of("message", "Sua inscrição já estava cancelada. Sentiremos sua falta!"));
            }

            subscriber.setActive(false);
            subscriberRepository.save(subscriber);

            return ResponseEntity
                    .ok(Map.of("message", "Inscrição cancelada com sucesso. Você não receberá mais nossos e-mails."));
        } catch (Exception e) {
            log.error("Error unsubscribing token {}: {}", token, e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("message", "Erro ao cancelar inscrição."));
        }
    }

    @GetMapping("/subscribers")
    public ResponseEntity<?> getAllSubscribers() {
        try {
            return ResponseEntity.ok(subscriberRepository.findAll());
        } catch (Exception e) {
            log.error("Error fetching subscribers: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("message", "Erro ao buscar inscritos."));
        }
    }

    @DeleteMapping("/subscribers/{id}")
    @Transactional
    public ResponseEntity<?> deleteSubscriber(@PathVariable UUID id) {
        try {
            if (!subscriberRepository.existsById(id)) {
                return ResponseEntity.status(404).body(Map.of("message", "Inscrito não encontrado."));
            }
            subscriberRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Inscrito removido com sucesso."));
        } catch (Exception e) {
            log.error("Error deleting subscriber {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("message", "Erro ao remover inscrito."));
        }
    }
}
