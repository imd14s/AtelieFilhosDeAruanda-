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

        // --- IDEMPOTÊNCIA: Evitar duplicatas em curto intervalo ---
        // Verifica se já existe um e-mail PENDENTE para o mesmo destinatário e tipo.
        if (emailQueueRepository.existsByRecipientAndTypeAndStatus(recipient, type.name(), EmailQueue.EmailStatus.PENDING)) {
            log.warn("Automação {} já está pendente para {}. Ignorando solicitação duplicada.", type, recipient);
            return;
        }

        Optional<EmailTemplate> templateOpt = emailTemplateRepository.findByAutomationTypeAndIsActiveTrue(type);

        if (templateOpt.isEmpty()) {
            log.warn("Nenhum template ativo encontrado para a automação: {}. O e-mail não será enviado.", type);
            return;
        }

        EmailTemplate template = templateOpt.get();
        String subject = template.getSubject();
        String content = template.getContent();

        // Substituição de placeholders {{{key}}}
        if (context != null) {
            for (Map.Entry<String, Object> entry : context.entrySet()) {
                String value = entry.getValue() != null ? entry.getValue().toString() : "";
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
                .status(EmailQueue.EmailStatus.PENDING) // Voltou a ser PENDING por padrão
                .type(type.name())
                .signatureId(template.getSignatureId())
                .build();

        EmailQueue savedEmail = emailQueueRepository.save(email);
        log.info("E-mail de automação {} enfileirado para {} com ID {}", type, recipient, savedEmail.getId());

        // Se for prioridade HIGH, tenta disparar imediatamente (usando o objeto salvo)
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
                    savedEmail.setRetryCount(1);
                    emailQueueRepository.save(savedEmail);
                }
            });
        }
    }
}
