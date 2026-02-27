package com.atelie.ecommerce.application.listener.loyalty;

import com.atelie.ecommerce.application.event.ReviewApprovedEvent;
import com.atelie.ecommerce.application.service.loyalty.LoyaltyService;
import com.atelie.ecommerce.application.service.marketing.EmailService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReviewApprovedEventListener {

    private static final Logger log = LoggerFactory.getLogger(ReviewApprovedEventListener.class);

    private final LoyaltyService loyaltyService;
    private final EmailService emailService;

    // Fixed point configuration per requirement. Can be moved to DB or
    // application.yml later.
    private static final int BASE_POINTS = 10;
    private static final int BONUS_MEDIA_POINTS = 20;

    @EventListener
    public void handleReviewApprovedEvent(ReviewApprovedEvent event) {
        log.info("Processing ReviewApprovedEvent for review: {}", event.getReviewId());

        try {
            int pointsToCredit = BASE_POINTS;
            if (event.isHasMedia()) {
                pointsToCredit += BONUS_MEDIA_POINTS;
            }

            var transaction = loyaltyService.creditPoints(
                    event.getUserId(),
                    pointsToCredit,
                    "Recompensa por Avaliação do Produto",
                    event.getReviewId());

            int newBalance = transaction.getWallet().getBalance();
            emailService.sendPointsEarnedEmail(event.getUserId(), pointsToCredit, newBalance);

            log.info("Successfully credited {} points to user {} for review {}. Notification sent.", pointsToCredit,
                    event.getUserId(), event.getReviewId());

        } catch (Exception e) {
            log.error("Failed to credit points for review approval {}: {}", event.getReviewId(), e.getMessage());
            // Intentionally catching exception so that failure to credit points does not
            // roll back the review approval.
        }
    }
}
