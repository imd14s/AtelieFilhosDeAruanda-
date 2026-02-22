package com.atelie.ecommerce.api.contact;

import com.atelie.ecommerce.application.service.marketing.EmailService;
import com.atelie.ecommerce.domain.marketing.model.EmailQueue;
import com.atelie.ecommerce.api.config.DynamicConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final EmailService emailService;
    private final DynamicConfigService configService;

    public ContactController(EmailService emailService, DynamicConfigService configService) {
        this.emailService = emailService;
        this.configService = configService;
    }

    @PostMapping
    public ResponseEntity<?> sendContactForm(@RequestBody Map<String, String> payload) {
        String name = payload.getOrDefault("name", "Visitante");
        String email = payload.getOrDefault("email", "sem-email@desconhecido.com");
        String subject = payload.getOrDefault("subject", "Contato via Site");
        String message = payload.getOrDefault("message", "");

        String adminEmail = configService.get("ADMIN_CONTACT_EMAIL", "mundodearuanda@gmail.com");

        String htmlContent = String.format(
                "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto'>" +
                        "<h2 style='color:#0f2A44;border-bottom:2px solid #C9A24D;padding-bottom:10px'>📬 Nova Mensagem de Contato</h2>"
                        +
                        "<table style='width:100%%;border-collapse:collapse'>" +
                        "<tr><td style='padding:8px;font-weight:bold;color:#555'>Nome:</td><td style='padding:8px'>%s</td></tr>"
                        +
                        "<tr><td style='padding:8px;font-weight:bold;color:#555'>E-mail:</td><td style='padding:8px'><a href='mailto:%s'>%s</a></td></tr>"
                        +
                        "<tr><td style='padding:8px;font-weight:bold;color:#555'>Assunto:</td><td style='padding:8px'>%s</td></tr>"
                        +
                        "</table>" +
                        "<div style='background:#f7f7f4;padding:16px;border-radius:8px;margin-top:16px'>" +
                        "<p style='color:#333;line-height:1.6'>%s</p>" +
                        "</div>" +
                        "<p style='color:#999;font-size:12px;margin-top:20px'>Enviado pelo formulário de contato do site Ateliê Filhos de Aruanda.</p>"
                        +
                        "</div>",
                name, email, email, subject, message.replace("\n", "<br/>"));

        try {
            EmailQueue emailQueue = new EmailQueue();
            emailQueue.setRecipient(adminEmail);
            emailQueue.setSubject("[Contato Site] " + subject + " — " + name);
            emailQueue.setContent(htmlContent);

            emailService.sendEmail(emailQueue);

            return ResponseEntity.ok(Map.of("message", "Mensagem enviada com sucesso!"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Erro ao enviar mensagem. Tente novamente."));
        }
    }
}
