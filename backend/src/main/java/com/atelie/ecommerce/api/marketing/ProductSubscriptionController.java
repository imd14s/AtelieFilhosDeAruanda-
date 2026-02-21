package com.atelie.ecommerce.api.marketing;

import com.atelie.ecommerce.infrastructure.persistence.marketing.ProductSubscriptionRepository;
import com.atelie.ecommerce.infrastructure.persistence.marketing.entity.ProductSubscriptionEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/product-subscriptions")
public class ProductSubscriptionController {

    private final ProductSubscriptionRepository subscriptionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ProductSubscriptionController(ProductSubscriptionRepository subscriptionRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/user/{userId}")
    public List<ProductSubscriptionEntity> getMySubscriptions(@PathVariable UUID userId) {
        return subscriptionRepository.findByUserId(userId);
    }

    @PostMapping
    public ResponseEntity<?> createSubscription(@RequestBody SubscriptionRequest request) {
        var product = productRepository.findById(request.productId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        var user = userRepository.findById(request.userId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        var subscription = ProductSubscriptionEntity.builder()
                .product(product)
                .user(user)
                .frequencyDays(request.frequencyDays())
                .nextDelivery(LocalDate.now().plusDays(request.frequencyDays()))
                .status("ACTIVE")
                .price(product.getPrice())
                .build();

        return ResponseEntity.ok(subscriptionRepository.save(subscription));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable UUID id, @RequestParam String status) {
        var subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
        subscription.setStatus(status);
        return ResponseEntity.ok(subscriptionRepository.save(subscription));
    }

    public record SubscriptionRequest(UUID userId, UUID productId, Integer frequencyDays) {
    }
}
