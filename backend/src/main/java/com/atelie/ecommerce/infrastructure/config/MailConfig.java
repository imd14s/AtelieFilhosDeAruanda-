package com.atelie.ecommerce.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();

        // Default configuration for local development.
        // In production, these should be overridden by environment variables if
        // possible,
        // or the specific spring.mail properties in application.yml.
        mailSender.setHost("localhost");
        mailSender.setPort(1025); // Default port for MailHog / Mailtrap

        mailSender.setUsername("dev-user");
        mailSender.setPassword("dev-password");

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "false");
        props.put("mail.smtp.starttls.enable", "false");
        props.put("mail.debug", "false");

        return mailSender;
    }
}
