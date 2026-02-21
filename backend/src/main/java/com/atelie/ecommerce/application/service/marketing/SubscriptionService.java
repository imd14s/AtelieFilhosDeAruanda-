package com.atelie.ecommerce.application.service.marketing;

import com.atelie.ecommerce.domain.marketing.model.Coupon;
import com.atelie.ecommerce.domain.marketing.model.EmailQueue;
import com.atelie.ecommerce.domain.marketing.model.Subscription;
import com.atelie.ecommerce.infrastructure.persistence.marketing.CouponRepository;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailQueueRepository;
import com.atelie.ecommerce.infrastructure.persistence.marketing.MarketingSubscriptionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SubscriptionService {

    private static final Logger log = LoggerFactory.getLogger(SubscriptionService.class);

    private final MarketingSubscriptionRepository subscriptionRepository;
    private final CouponRepository couponRepository;
    private final EmailQueueRepository emailQueueRepository;

    public SubscriptionService(MarketingSubscriptionRepository subscriptionRepository,
            CouponRepository couponRepository,
            EmailQueueRepository emailQueueRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.couponRepository = couponRepository;
        this.emailQueueRepository = emailQueueRepository;
    }

    @Scheduled(cron = "0 0 1 * * ?") // Runs every day at 01:00 AM
    @Transactional
    public void processDailyRenewals() {
        log.info("Starting daily subscription renewal process...");
        LocalDateTime now = LocalDateTime.now();
        List<Subscription> toRenew = subscriptionRepository.findByStatusAndNextBillingAtLessThanEqual(
                Subscription.SubscriptionStatus.ACTIVE, now);

        for (Subscription sub : toRenew) {
            try {
                processRenewal(sub);
            } catch (Exception e) {
                log.error("Failed to renew subscription {}: {}", sub.getId(), e.getMessage());
            }
        }
    }

    private void processRenewal(Subscription sub) {
        // Here we would call the Payment Gateway (Mercado Pago / Stripe)
        log.info("Processing renewal for user {} - Plan: {}", sub.getUserId(), sub.getPlanName());

        // Simulating SUCCESSful payment
        boolean paymentSuccess = true;

        if (paymentSuccess) {
            // 1. Update next billing date
            sub.setNextBillingAt(calculateNextBilling(sub));
            subscriptionRepository.save(sub);

            // 2. Generate 2 reward coupons
            generateRewardCoupons(sub.getUserId());

            // 3. Queue success email
            queueSubscriptionEmail(sub, "✨ Renovação de Assinatura Confirmada!",
                    "Olá! Seu Kit do Ateliê Filhos de Aruanda foi renovado com sucesso. " +
                            "Como presente, 2 novos cupons de 10% foram adicionados ao seu perfil!");
        } else {
            // Handle failures (retries or notification)
            queueSubscriptionEmail(sub, "⚠️ Problema na Renovação da Assinatura",
                    "Poxa! Não conseguimos processar o pagamento da sua assinatura. Verifique seus dados de pagamento.");
        }
    }

    private void generateRewardCoupons(UUID userId) {
        for (int i = 0; i < 2; i++) {
            String code = "SUB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            Coupon coupon = Coupon.builder()
                    .code(code)
                    .type(Coupon.CouponType.PERCENTAGE)
                    .value(new BigDecimal("10.00"))
                    .startDate(LocalDateTime.now())
                    .endDate(LocalDateTime.now().plusDays(20))
                    .usageLimit(1)
                    .usageLimitPerUser(1)
                    .minPurchaseValue(new BigDecimal("50.00"))
                    .ownerId(userId)
                    .active(true)
                    .build();
            couponRepository.save(coupon);
        }
    }

    private void queueSubscriptionEmail(Subscription sub, String subject, String content) {
        // Find user email (mocked for now, usually join with User table)
        // In a real scenario, we'd fetch the email from the UserEntity
        String userEmail = "cliente@teste.com";

        EmailQueue email = EmailQueue.builder()
                .recipient(userEmail)
                .subject(subject)
                .content(content)
                .priority(EmailQueue.EmailPriority.HIGH)
                .status(EmailQueue.EmailStatus.PENDING)
                .type("SUBSCRIPTION_UPDATE")
                .scheduledAt(LocalDateTime.now())
                .build();
        emailQueueRepository.save(email);
    }

    private LocalDateTime calculateNextBilling(Subscription sub) {
        if (sub.getFrequency() == Subscription.SubscriptionFrequency.WEEKLY) {
            return sub.getNextBillingAt().plusWeeks(1);
        } else {
            return sub.getNextBillingAt().plusMonths(1);
        }
    }
}
