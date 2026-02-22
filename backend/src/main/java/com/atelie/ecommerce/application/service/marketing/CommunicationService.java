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

@Service
@RequiredArgsConstructor
@Slf4j
public class CommunicationService {

    private final EmailQueueRepository emailQueueRepository;
    private final EmailTemplateRepository emailTemplateRepository;

    @Transactional
    public void sendAutomation(AutomationType type, String recipient, Map<String, Object> context) {
        log.info("Processando automação {} para {}", type, recipient);

        Optional<EmailTemplate> templateOpt = emailTemplateRepository.findByAutomationTypeAndIsActiveTrue(type);

        if (templateOpt.isEmpty()) {
            log.warn("Nenhum template ativo encontrado para a automação: {}. O e-mail não será enviado.", type);
            return;
        }

        EmailTemplate template = templateOpt.get();
        String subject = template.getSubject();
        String content = template.getContent();

        // Substituição de placeholders {{key}}
        if (context != null) {
            for (Map.Entry<String, Object> entry : context.entrySet()) {
                String placeholder = "{{" + entry.getKey() + "}}";
                String value = entry.getValue() != null ? entry.getValue().toString() : "";
                content = content.replace(placeholder, value);
                subject = subject.replace(placeholder, value);
            }
        }

        EmailQueue email = EmailQueue.builder()
                .recipient(recipient)
                .subject(subject)
                .content(content)
                .priority(EmailQueue.EmailPriority.HIGH)
                .status(EmailQueue.EmailStatus.PENDING)
                .type(type.name())
                .signatureId(template.getSignatureId())
                .build();

        emailQueueRepository.save(email);
        log.info("E-mail de automação {} enfileirado para {}", type, recipient);
    }
}
