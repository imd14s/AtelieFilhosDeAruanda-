package com.atelie.ecommerce.api.subscription;

import com.atelie.ecommerce.application.dto.subscription.SubscriptionRequestDTO;
import com.atelie.ecommerce.application.service.subscription.UserSubscriptionService;
import com.atelie.ecommerce.infrastructure.persistence.subscription.entity.SubscriptionEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/subscriptions")
public class UserSubscriptionController {

    private static final Logger log = LoggerFactory.getLogger(UserSubscriptionController.class);

    private final UserSubscriptionService subscriptionService;

    public UserSubscriptionController(UserSubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping("/my")
    public ResponseEntity<List<SubscriptionEntity>> getMySubscriptions(@RequestParam UUID userId) {
        // In a real scenario, the userId would be extracted from the JWT token
        return ResponseEntity.ok(subscriptionService.getUserSubscriptions(userId));
    }

    @PostMapping
    public ResponseEntity<SubscriptionEntity> create(@RequestParam UUID userId,
            @RequestBody SubscriptionRequestDTO request) {
        return ResponseEntity.ok(subscriptionService.createSubscription(userId, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<SubscriptionEntity> updateStatus(@PathVariable UUID id, @RequestParam String status) {
        return ResponseEntity.ok(subscriptionService.updateStatus(id, status));
    }
}
