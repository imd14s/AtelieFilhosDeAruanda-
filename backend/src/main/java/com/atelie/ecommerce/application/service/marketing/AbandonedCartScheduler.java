package com.atelie.ecommerce.application.service.marketing;

import com.atelie.ecommerce.domain.marketing.model.AbandonedCartConfig;
import com.atelie.ecommerce.infrastructure.persistence.marketing.AbandonedCartConfigRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AbandonedCartScheduler {

    private static final Logger log = LoggerFactory.getLogger(AbandonedCartScheduler.class);
    private final AbandonedCartConfigRepository configRepository;

    public AbandonedCartScheduler(AbandonedCartConfigRepository configRepository) {
        this.configRepository = configRepository;
    }

    @Scheduled(fixedDelay = 300000) // 5 minutes
    public void processAbandonedCarts() {
        List<AbandonedCartConfig> configs = configRepository.findAll();
        if (configs.isEmpty() || !Boolean.TRUE.equals(configs.get(0).getEnabled())) {
            return;
        }

        AbandonedCartConfig config = configs.get(0);
        log.info("Checking for abandoned carts using triggers: {}", config.getTriggers());

        // Logic to find carts and send emails would go here.
        // Needs integration with Cart Repository and Email Service which are not fully
        // visible yet.
        // Keeping as a skeleton placeholder as requested.
    }
}
