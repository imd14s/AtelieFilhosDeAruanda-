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
    private final EmailSignatureService signatureService;

    public EmailService(JavaMailSender mailSender, DynamicConfigService configService,
            EmailSignatureService signatureService) {
        this.mailSender = mailSender;
        this.configService = configService;
        this.signatureService = signatureService;
    }

    public void sendEmail(EmailQueue email) throws MessagingException {
        log.info("Sending email to {} - Subject: {}", email.getRecipient(), email.getSubject());

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        String senderEmail = configService.requireString("MAIL_SENDER_ADDRESS");
        String senderName = configService.requireString("MAIL_SENDER_NAME");
        String frontendUrl = configService.requireString("FRONTEND_URL");

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
}
