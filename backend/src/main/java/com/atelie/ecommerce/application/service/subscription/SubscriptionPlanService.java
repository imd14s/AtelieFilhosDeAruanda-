package com.atelie.ecommerce.application.service.subscription;

import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.infrastructure.persistence.subscription.entity.SubscriptionPlanEntity;
import com.atelie.ecommerce.infrastructure.persistence.subscription.repository.SubscriptionPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class SubscriptionPlanService {

    private final SubscriptionPlanRepository planRepository;

    public SubscriptionPlanService(SubscriptionPlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    public List<SubscriptionPlanEntity> listAll() {
        return planRepository.findAll();
    }

    public List<SubscriptionPlanEntity> listActive() {
        return planRepository.findByActiveTrue();
    }

    public SubscriptionPlanEntity getById(UUID id) {
        return planRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Plano não encontrado"));
    }

    @Transactional
    public SubscriptionPlanEntity save(SubscriptionPlanEntity plan) {
        if (plan.getFrequencyRules() != null) {
            plan.getFrequencyRules().forEach(rule -> rule.setPlan(plan));
        }
        if (plan.getProducts() != null) {
            plan.getProducts().forEach(p -> p.setPlan(plan));
        }
        return planRepository.save(plan);
    }

    @Transactional
    public void delete(UUID id) {
        planRepository.deleteById(id);
    }
}
