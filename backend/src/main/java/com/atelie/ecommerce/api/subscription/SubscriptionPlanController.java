package com.atelie.ecommerce.api.subscription;

import com.atelie.ecommerce.application.service.subscription.SubscriptionPlanService;
import com.atelie.ecommerce.infrastructure.persistence.subscription.entity.SubscriptionPlanEntity;
import com.atelie.ecommerce.infrastructure.service.media.MediaStorageService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/subscription-plans")
public class SubscriptionPlanController {

    private final SubscriptionPlanService planService;
    private final MediaStorageService mediaStorageService;

    public SubscriptionPlanController(SubscriptionPlanService planService, MediaStorageService mediaStorageService) {
        this.planService = planService;
        this.mediaStorageService = mediaStorageService;
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionPlanEntity>> getAll() {
        return ResponseEntity.ok(planService.listAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<SubscriptionPlanEntity>> getActive() {
        return ResponseEntity.ok(planService.listActive());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionPlanEntity> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(planService.getById(id));
    }

    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<SubscriptionPlanEntity> create(
            @RequestPart("plan") SubscriptionPlanEntity plan,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(planService.save(plan, image));
    }

    @PutMapping(value = "/{id}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<SubscriptionPlanEntity> update(
            @PathVariable UUID id,
            @RequestPart("plan") SubscriptionPlanEntity plan,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        plan.setId(id);
        return ResponseEntity.ok(planService.save(plan, image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        planService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
