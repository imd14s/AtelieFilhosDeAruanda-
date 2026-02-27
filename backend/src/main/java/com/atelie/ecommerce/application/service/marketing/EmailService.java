package com.atelie.ecommerce.application.service.marketing;

import com.atelie.ecommerce.domain.marketing.model.EmailQueue;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.atelie.ecommerce.application.service.config.DynamicConfigService;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailConfigRepository;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.io.UnsupportedEncodingException;
import java.util.Properties;
import java.util.UUID;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final DynamicConfigService configService;
    private final EmailSignatureService signatureService;
    private final EmailConfigRepository emailConfigRepository;
    private final UserRepository userRepository;

    public EmailService(DynamicConfigService configService,
            EmailSignatureService signatureService,
            EmailConfigRepository emailConfigRepository,
            UserRepository userRepository) {
        this.configService = configService;
        this.signatureService = signatureService;
        this.emailConfigRepository = emailConfigRepository;
        this.userRepository = userRepository;
    }

    private JavaMailSender createDynamicMailSender() {
        var configs = emailConfigRepository.findAll();
        if (configs.isEmpty()) {
            throw new IllegalStateException("SMTP Configuration not found in database.");
        }
        var config = configs.get(0);

        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(config.getMailHost());
        mailSender.setPort(config.getMailPort());
        mailSender.setUsername(config.getMailUsername());
        mailSender.setPassword(config.getMailPassword());

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.debug", "false");

        return mailSender;
    }

    public void sendEmail(EmailQueue email) throws MessagingException {
        JavaMailSender mailSender = createDynamicMailSender();

        var configs = emailConfigRepository.findAll();
        var emailSettings = configs.get(0);

        log.info("Sending email to {} - Subject: {}", email.getRecipient(), email.getSubject());

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        String senderEmail = emailSettings.getMailSenderAddress();
        String senderName = emailSettings.getMailSenderName();
        String frontendUrl = configService.getString("FRONTEND_URL");
        if (frontendUrl == null)
            frontendUrl = "http://localhost:3001";

        try {
            helper.setFrom(senderEmail, senderName);
        } catch (UnsupportedEncodingException e) {
            helper.setFrom(senderEmail);
        }

        helper.setTo(email.getRecipient());
        helper.setSubject(email.getSubject());

        String content = email.getContent();
        if (email.getSignatureId() != null) {
            try {
                var sig = signatureService.findById(email.getSignatureId());
                if (sig != null) {
                    content += "<br><br>" + signatureService.generateHtml(sig);
                }
            } catch (Exception e) {
                log.warn("Could not load signature {}: {}", email.getSignatureId(), e.getMessage());
            }
        }

        helper.setText(content, true); // true = HTML

        // Add List-Unsubscribe header dynamically
        String unsubscribeLink = frontendUrl + "/unsubscribe";
        message.addHeader("List-Unsubscribe", "<" + unsubscribeLink + ">");

        mailSender.send(message);
    }

    public void sendPointsEarnedEmail(UUID userId, int pointsGained, int newBalance) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        String subject = "Você ganhou " + pointsGained + " pontos no Ateliê!";
        String content = "<h2>Parabéns, " + user.getName() + "!</h2>" +
                "<p>Sua avaliação foi aprovada e você acaba de ganhar <strong>" + pointsGained
                + " pontos</strong> de fidelidade.</p>" +
                "<p>Seu saldo atual é de <strong>" + newBalance + " pontos</strong>.</p>" +
                "<p>Use seus pontos como desconto na sua próxima compra!</p>";

        EmailQueue email = new EmailQueue();
        email.setRecipient(user.getEmail());
        email.setSubject(subject);
        email.setContent(content);

        try {
            sendEmail(email);
        } catch (MessagingException e) {
            log.error("Failed to send points earned email to {}", user.getEmail(), e);
        }
    }
}
