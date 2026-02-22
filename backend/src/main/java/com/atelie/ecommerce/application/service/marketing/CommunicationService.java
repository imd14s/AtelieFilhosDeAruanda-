package com.atelie.ecommerce.application.service.marketing;

import com.atelie.ecommerce.domain.marketing.model.AutomationType;
import com.atelie.ecommerce.domain.marketing.model.EmailQueue;
import com.atelie.ecommerce.domain.marketing.model.EmailTemplate;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailQueueRepository;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommunicationService {

    private final EmailQueueRepository emailQueueRepository;
    private final EmailTemplateRepository emailTemplateRepository;
    private final EmailService emailService;

    @Transactional
    public void sendAutomation(AutomationType type, String recipient, Map<String, Object> context) {
        // Por padrão, decide a prioridade baseada no tipo se não for informada
        EmailQueue.EmailPriority priority = (type == AutomationType.USER_VERIFY
                || type == AutomationType.PASSWORD_RESET)
                        ? EmailQueue.EmailPriority.HIGH
                        : EmailQueue.EmailPriority.MEDIUM;
        sendAutomation(type, recipient, context, priority);
    }

    @Transactional
    public void sendAutomation(AutomationType type, String recipient, Map<String, Object> context,
            EmailQueue.EmailPriority priority) {
        log.info("Processando automação {} para {} com prioridade {}", type, recipient, priority);

        Optional<EmailTemplate> templateOpt = emailTemplateRepository.findByAutomationTypeAndIsActiveTrue(type);

        if (templateOpt.isEmpty()) {
            log.warn("Nenhum template ativo encontrado para a automação: {}. O e-mail não será enviado.", type);
            return;
        }

        EmailTemplate template = templateOpt.get();
        String subject = template.getSubject();
        String content = template.getContent();

        // Substituição de placeholders {{{key}}} - Suportando o padrão Triplo-chaves
        // usado no Hub
        if (context != null) {
            for (Map.Entry<String, Object> entry : context.entrySet()) {
                String value = entry.getValue() != null ? entry.getValue().toString() : "";

                // Suporta {{key}} e {{{key}}}
                content = content.replace("{{{" + entry.getKey() + "}}}", value);
                content = content.replace("{{" + entry.getKey() + "}}", value);
                subject = subject.replace("{{{" + entry.getKey() + "}}}", value);
                subject = subject.replace("{{" + entry.getKey() + "}}", value);
            }
        }

        EmailQueue email = EmailQueue.builder()
                .recipient(recipient)
                .subject(subject)
                .content(content)
                .priority(priority != null ? priority : EmailQueue.EmailPriority.LOW)
                .status(EmailQueue.EmailStatus.PENDING)
                .type(type.name())
                .signatureId(template.getSignatureId())
                .build();

        EmailQueue savedEmail = emailQueueRepository.save(email);
        log.info("E-mail de automação {} enfileirado para {} com ID {}", type, recipient, savedEmail.getId());

        // Se for prioridade HIGH (como USER_VERIFY ou PASSWORD_RESET), tenta disparar
        // imediatamente
        if (savedEmail.getPriority() == EmailQueue.EmailPriority.HIGH) {
            CompletableFuture.runAsync(() -> {
                try {
                    log.info("Iniciando envio assíncrono imediato para {}", recipient);
                    emailService.sendEmail(savedEmail);
                    savedEmail.setStatus(EmailQueue.EmailStatus.SENT);
                    savedEmail.setSentAt(java.time.LocalDateTime.now());
                    emailQueueRepository.save(savedEmail);
                    log.info("Envio assíncrono imediato concluído para {}", recipient);
                } catch (Exception e) {
                    log.error("Falha no envio assíncrono imediato para {}: {}", recipient, e.getMessage());
                    savedEmail.setLastError(e.getMessage());
                    savedEmail.setRetryCount(savedEmail.getRetryCount() + 1);
                    emailQueueRepository.save(savedEmail);
                }
            });
        }
    }
}
