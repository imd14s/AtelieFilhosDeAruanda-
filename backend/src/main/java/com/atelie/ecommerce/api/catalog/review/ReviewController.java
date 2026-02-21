package com.atelie.ecommerce.api.catalog.review;

import com.atelie.ecommerce.application.service.review.ReviewService;
import com.atelie.ecommerce.infrastructure.persistence.review.ReviewEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewEntity> create(@RequestBody ReviewCreateRequest request) {
        // Obter user_id do contexto de segurança (Spring Security)
        // Por agora, assumiremos que vem no request ou simularemos para teste
        UUID userId = request.userId();

        ReviewEntity review = reviewService.createReview(
                userId,
                request.productId(),
                request.rating(),
                request.comment(),
                request.media());
        return ResponseEntity.ok(review);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewEntity>> getByProduct(@PathVariable UUID productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    public record ReviewCreateRequest(
            UUID userId,
            UUID productId,
            Integer rating,
            String comment,
            List<Map<String, String>> media) {
    }
}
