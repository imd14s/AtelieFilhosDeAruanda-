package com.atelie.ecommerce.application.service.marketing;

import com.atelie.ecommerce.domain.marketing.model.EmailQueue;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(EmailQueue email) throws MessagingException {
        log.info("Sending email to {} - Subject: {}", email.getRecipient(), email.getSubject());

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(email.getRecipient());
        helper.setSubject(email.getSubject());
        helper.setText(email.getContent(), true); // true = HTML

        // Add List-Unsubscribe header for better deliverability
        // This is a placeholder, usually it's a link to the unsubscribe endpoint
        message.addHeader("List-Unsubscribe", "<mailto:unsubscribe@atelie.com>, <https://atelie.com/unsubscribe>");

        mailSender.send(message);
    }
}
