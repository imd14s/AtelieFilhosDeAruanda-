package com.atelie.ecommerce.application.service.marketing;

import com.atelie.ecommerce.domain.marketing.model.EmailQueue;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailQueueRepository;
import com.atelie.ecommerce.infrastructure.persistence.marketing.NewsletterSubscriberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class MarketingMetricsService {

    private final UserRepository userRepository;
    private final NewsletterSubscriberRepository newsletterRepository;
    private final EmailQueueRepository emailQueueRepository;

    public Map<String, Long> getMetrics() {
        long totalCustomers = userRepository.countByRole("CUSTOMER");
        long totalNewsletter = newsletterRepository.count();
        long totalRegistrations = totalCustomers + totalNewsletter;

        long verifiedCustomers = userRepository.countByRoleAndEmailVerifiedTrue("CUSTOMER");
        long verifiedNewsletter = newsletterRepository.countByEmailVerifiedTrue();
        long totalVerified = verifiedCustomers + verifiedNewsletter;

        long totalSent = emailQueueRepository.countByStatus(EmailQueue.EmailStatus.SENT);

        return Map.of(
                "totalRegistrations", totalRegistrations,
                "totalVerified", totalVerified,
                "totalSent", totalSent);
    }
}
