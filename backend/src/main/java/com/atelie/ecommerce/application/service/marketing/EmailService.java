package com.atelie.ecommerce.application.service.marketing;

import com.atelie.ecommerce.domain.marketing.model.EmailQueue;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.atelie.ecommerce.api.config.DynamicConfigService;

import java.io.UnsupportedEncodingException;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;
    private final DynamicConfigService configService;

    public EmailService(JavaMailSender mailSender, DynamicConfigService configService) {
        this.mailSender = mailSender;
        this.configService = configService;
    }

    public void sendEmail(EmailQueue email) throws MessagingException {
        log.info("Sending email to {} - Subject: {}", email.getRecipient(), email.getSubject());

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        String senderEmail = configService.get("MAIL_SENDER_ADDRESS", "nao-responda@ateliedearuanda.com.br");
        String senderName = configService.get("MAIL_SENDER_NAME", "Ateliê Filhos de Aruanda");
        String frontendUrl = configService.get("FRONTEND_URL", "http://localhost:5173");

        try {
            helper.setFrom(senderEmail, senderName);
        } catch (UnsupportedEncodingException e) {
            helper.setFrom(senderEmail);
        }

        helper.setTo(email.getRecipient());
        helper.setSubject(email.getSubject());
        helper.setText(email.getContent(), true); // true = HTML

        // Add List-Unsubscribe header dynamically
        String unsubscribeLink = frontendUrl + "/unsubscribe";
        message.addHeader("List-Unsubscribe", "<" + unsubscribeLink + ">");

        mailSender.send(message);
    }
}
