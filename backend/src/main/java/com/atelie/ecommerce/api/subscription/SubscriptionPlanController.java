package com.atelie.ecommerce.api.subscription;

import com.atelie.ecommerce.application.service.subscription.SubscriptionPlanService;
import com.atelie.ecommerce.infrastructure.persistence.subscription.entity.SubscriptionPlanEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/subscription-plans")
public class SubscriptionPlanController {

    private final SubscriptionPlanService planService;

    public SubscriptionPlanController(SubscriptionPlanService planService) {
        this.planService = planService;
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

    @PostMapping
    public ResponseEntity<SubscriptionPlanEntity> create(@RequestBody SubscriptionPlanEntity plan) {
        return ResponseEntity.ok(planService.save(plan));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionPlanEntity> update(@PathVariable UUID id,
            @RequestBody SubscriptionPlanEntity plan) {
        plan.setId(id);
        return ResponseEntity.ok(planService.save(plan));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        planService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
