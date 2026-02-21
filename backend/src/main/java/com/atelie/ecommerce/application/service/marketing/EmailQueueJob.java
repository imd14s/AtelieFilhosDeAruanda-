package com.atelie.ecommerce.application.service.marketing;

import com.atelie.ecommerce.domain.marketing.model.EmailQueue;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailQueueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmailQueueJob {

    private static final Logger log = LoggerFactory.getLogger(EmailQueueJob.class);
    private static final int DAILY_LIMIT = 450; // Targeted for Gmail 500 limit
    private static final int BATCH_SIZE = 20;

    private final EmailQueueRepository emailQueueRepository;
    private final EmailService emailService;

    public EmailQueueJob(EmailQueueRepository emailQueueRepository, EmailService emailService) {
        this.emailQueueRepository = emailQueueRepository;
        this.emailService = emailService;
    }

    @Scheduled(fixedDelay = 60000) // Runs every minute
    public void processQueue() {
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        long sentToday = emailQueueRepository.countByStatusAndSentAtAfter(EmailQueue.EmailStatus.SENT, today);

        if (sentToday >= DAILY_LIMIT) {
            log.warn("Daily email limit reached ({}/{}). Skipping queue processing.", sentToday, DAILY_LIMIT);
            return;
        }

        int remainingQuota = DAILY_LIMIT - (int) sentToday;
        int limit = Math.min(BATCH_SIZE, remainingQuota);

        List<EmailQueue> pendingEmails = emailQueueRepository.findPendingEmails(LocalDateTime.now());

        if (pendingEmails.isEmpty()) {
            return;
        }

        log.info("Processing {} emails from queue. Daily quota used: {}/{}", Math.min(pendingEmails.size(), limit),
                sentToday, DAILY_LIMIT);

        for (int i = 0; i < Math.min(pendingEmails.size(), limit); i++) {
            EmailQueue email = pendingEmails.get(i);
            try {
                emailService.sendEmail(email);
                email.setStatus(EmailQueue.EmailStatus.SENT);
                email.setSentAt(LocalDateTime.now());
            } catch (Exception e) {
                log.error("Failed to send email to {}: {}", email.getRecipient(), e.getMessage());
                email.setRetryCount(email.getRetryCount() + 1);
                email.setLastError(e.getMessage());
                if (email.getRetryCount() >= 3) {
                    email.setStatus(EmailQueue.EmailStatus.FAILED);
                }
            }
            emailQueueRepository.save(email);

            // Small delay to avoid triggering spam filters (throttling)
            try {
                Thread.sleep(2000);
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
            }
        }
    }
}
