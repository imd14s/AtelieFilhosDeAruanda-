package com.atelie.ecommerce.application.service.marketing;

import com.atelie.ecommerce.domain.marketing.model.EmailQueue;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailQueueRepository;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailCampaignRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class EmailQueueJob {

    private static final Logger log = LoggerFactory.getLogger(EmailQueueJob.class);
    private static final int DAILY_LIMIT = 450;
    private static final int BATCH_SIZE = 20;

    private final EmailQueueRepository emailQueueRepository;
    private final EmailService emailService;
    private final EmailCampaignRepository campaignRepository;

    public EmailQueueJob(EmailQueueRepository emailQueueRepository, EmailService emailService,
            EmailCampaignRepository campaignRepository) {
        this.emailQueueRepository = emailQueueRepository;
        this.emailService = emailService;
        this.campaignRepository = campaignRepository;
    }

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void processQueue() {
        log.info("[DEBUG-NEWSLETTER] EmailQueueJob.processQueue() executado em {}", LocalDateTime.now());

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

        int count = Math.min(pendingEmails.size(), limit);
        log.info("Processing {} emails from queue. Daily quota used: {}/{}", count, sentToday, DAILY_LIMIT);

        for (int i = 0; i < count; i++) {
            EmailQueue email = pendingEmails.get(i);
            try {
                emailService.sendEmail(email);
                email.setStatus(EmailQueue.EmailStatus.SENT);
                email.setSentAt(LocalDateTime.now());

                if (email.getCampaignId() != null) {
                    updateCampaignProgress(email.getCampaignId());
                }
            } catch (Exception e) {
                log.error("Failed to send email to {}: {}", email.getRecipient(), e.getMessage());
                email.setRetryCount(email.getRetryCount() + 1);
                email.setLastError(e.getMessage());
                if (email.getRetryCount() >= 3) {
                    email.setStatus(EmailQueue.EmailStatus.FAILED);
                }
            }
            emailQueueRepository.save(email);

            // Skip delay for HIGH priority emails to meet the < 2s requirement
            if (email.getPriority() != EmailQueue.EmailPriority.HIGH) {
                try {
                    Thread.sleep(2000);
                } catch (InterruptedException ex) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
    }

    private void updateCampaignProgress(UUID campaignId) {
        campaignRepository.findById(campaignId).ifPresent(campaign -> {
            long totalSent = emailQueueRepository.countByCampaignIdAndStatus(campaignId, EmailQueue.EmailStatus.SENT);
            campaign.setSentCount((int) totalSent);

            if (totalSent >= campaign.getTotalRecipients()) {
                campaign.setStatus(com.atelie.ecommerce.domain.marketing.model.EmailCampaign.CampaignStatus.COMPLETED);
            }
            campaignRepository.save(campaign);
        });
    }
}
