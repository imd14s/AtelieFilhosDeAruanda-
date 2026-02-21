package com.atelie.ecommerce.api.marketing;

import com.atelie.ecommerce.infrastructure.persistence.marketing.ProductViewHistoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.marketing.entity.ProductViewHistoryEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/history")
public class ProductViewHistoryController {

    private final ProductViewHistoryRepository historyRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ProductViewHistoryController(ProductViewHistoryRepository historyRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.historyRepository = historyRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/user/{userId}")
    public List<ProductViewHistoryEntity> getMyHistory(@PathVariable UUID userId) {
        return historyRepository.findByUserIdOrderByViewedAtDesc(userId);
    }

    @PostMapping
    public ResponseEntity<?> recordView(@RequestBody HistoryRequest request) {
        var product = productRepository.findById(request.productId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        var user = userRepository.findById(request.userId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        var history = ProductViewHistoryEntity.builder()
                .id(new ProductViewHistoryEntity.HistoryId(request.userId(), request.productId()))
                .product(product)
                .user(user)
                .build();

        return ResponseEntity.ok(historyRepository.save(history));
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> clearHistory(@PathVariable UUID userId) {
        var userHistory = historyRepository.findByUserIdOrderByViewedAtDesc(userId);
        historyRepository.deleteAll(userHistory);
        return ResponseEntity.noContent().build();
    }

    public record HistoryRequest(UUID userId, UUID productId) {
    }
}
