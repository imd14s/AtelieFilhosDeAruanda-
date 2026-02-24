package com.atelie.ecommerce.application.service.subscription;

import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.infrastructure.persistence.subscription.entity.SubscriptionPlanEntity;
import com.atelie.ecommerce.infrastructure.persistence.subscription.entity.SubscriptionPlanProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.subscription.repository.SubscriptionPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class SubscriptionPlanService {

    private final SubscriptionPlanRepository planRepository;
    private final com.atelie.ecommerce.infrastructure.service.media.MediaStorageService mediaStorageService;

    public SubscriptionPlanService(SubscriptionPlanRepository planRepository,
            com.atelie.ecommerce.infrastructure.service.media.MediaStorageService mediaStorageService) {
        this.planRepository = planRepository;
        this.mediaStorageService = mediaStorageService;
    }

    public List<SubscriptionPlanEntity> listAll() {
        return planRepository.findAll();
    }

    @Cacheable("subscription-plans")
    public List<SubscriptionPlanEntity> listActive() {
        return planRepository.findByActiveTrue();
    }

    public SubscriptionPlanEntity getById(UUID id) {
        return planRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Plano não encontrado"));
    }

    @CacheEvict(value = "subscription-plans", allEntries = true)
    @Transactional
    public SubscriptionPlanEntity save(SubscriptionPlanEntity plan,
            org.springframework.web.multipart.MultipartFile image) {
        if (plan.getId() == null) {
            plan.setId(UUID.randomUUID());
        }

        if (image != null && !image.isEmpty()) {
            try {
                var mediaAsset = mediaStorageService.upload(image, "subscription-plan", true);
                plan.setImageUrl("/api/media/public/" + mediaAsset.getId());
            } catch (Exception e) {
                throw new RuntimeException("Falha ao salvar imagem do plano: " + e.getMessage());
            }
        }

        if (plan.getFrequencyRules() != null) {
            plan.getFrequencyRules().removeIf(rule -> rule == null);
            plan.getFrequencyRules().forEach(rule -> rule.setPlan(plan));
        }

        if (plan.getProducts() != null) {
            plan.getProducts().removeIf(p -> p == null || p.getProduct() == null || p.getProduct().getId() == null);
            plan.getProducts().forEach(p -> {
                p.setPlan(plan);
                p.setId(new SubscriptionPlanProductEntity.SubscriptionPlanProductId(
                        plan.getId(),
                        p.getProduct().getId()));
            });
        }

        return planRepository.save(plan);
    }

    @CacheEvict(value = "subscription-plans", allEntries = true)
    @Transactional
    public void delete(UUID id) {
        planRepository.deleteById(id);
    }
}
