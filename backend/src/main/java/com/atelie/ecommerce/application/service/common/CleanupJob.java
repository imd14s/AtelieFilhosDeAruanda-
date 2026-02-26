package com.atelie.ecommerce.application.service.common;

import com.atelie.ecommerce.domain.marketing.model.NewsletterSubscriber;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import com.atelie.ecommerce.infrastructure.persistence.marketing.NewsletterSubscriberRepository;
import com.atelie.ecommerce.application.service.config.DynamicConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Slf4j
public class CleanupJob {

    private final UserRepository userRepository;
    private final NewsletterSubscriberRepository subscriberRepository;
    private final DynamicConfigService configService;

    public CleanupJob(UserRepository userRepository,
            NewsletterSubscriberRepository subscriberRepository,
            DynamicConfigService configService) {
        this.userRepository = userRepository;
        this.subscriberRepository = subscriberRepository;
        this.configService = configService;
    }

    /**
     * Run every hour to cleanup unverified accounts and subscribers.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanupUnverified() {
        String waitTime = configService.get("SECURITY_UNVERIFIED_WAIT_TIME", "24h");
        int hours;
        switch (waitTime) {
            case "48h":
                hours = 48;
                break;
            case "7d":
                hours = 24 * 7;
                break;
            case "24h":
            default:
                hours = 24;
                break;
        }

        LocalDateTime cutoff = LocalDateTime.now().minusHours(hours);
        log.info("Starting cleanup for records created before {} (Wait time: {})", cutoff, waitTime);

        // Cleanup unverified users
        long deletedUsers = userRepository.findAll().stream()
                .filter(u -> !u.getEmailVerified() && u.getCreatedAt().isBefore(cutoff))
                .peek(u -> userRepository.delete(u))
                .count();

        // Cleanup unverified newsletter subscribers
        long deletedSubscribers = subscriberRepository.findAll().stream()
                .filter(s -> !s.getEmailVerified() && s.getSubscribedAt().isBefore(cutoff))
                .peek(s -> subscriberRepository.delete(s))
                .count();

        if (deletedUsers > 0 || deletedSubscribers > 0) {
            log.info("Cleanup completed: Deleted {} unverified users and {} unverified subscribers.",
                    deletedUsers, deletedSubscribers);
        }
    }
}
