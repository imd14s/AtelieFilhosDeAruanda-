package com.atelie.ecommerce.api.catalog.review;

import com.atelie.ecommerce.application.service.review.ReviewService;
import com.atelie.ecommerce.infrastructure.persistence.review.ReviewEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
        return ResponseEntity.ok(reviewService.createReview(
                request.userId(),
                request.productId(),
                request.rating(),
                request.comment(),
                request.media()));
    }

    @PostMapping(value = "/verified", consumes = "multipart/form-data")
    public ResponseEntity<ReviewEntity> createVerified(
            @RequestPart("token") String token,
            @RequestPart("rating") String rating,
            @RequestPart("comment") String comment,
            @RequestPart(value = "media", required = false) List<MultipartFile> media) {

        ReviewEntity review = reviewService.createVerifiedReview(
                token,
                Integer.parseInt(rating),
                comment,
                media);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/token/{token}")
    public ResponseEntity<com.atelie.ecommerce.infrastructure.persistence.review.ReviewTokenEntity> validateToken(
            @PathVariable String token) {
        return ResponseEntity.ok(reviewService.validateToken(token));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<java.util.List<ReviewEntity>> getByProduct(@PathVariable UUID productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<java.util.List<ReviewEntity>> getByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(reviewService.getUserReviews(userId));
    }

    @GetMapping("/user/{userId}/pending")
    public ResponseEntity<java.util.List<com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity>> getPending(
            @PathVariable UUID userId) {
        return ResponseEntity.ok(reviewService.getPendingReviews(userId));
    }

    public record ReviewCreateRequest(
            UUID userId,
            UUID productId,
            Integer rating,
            String comment,
            java.util.List<Map<String, String>> media) {
    }

    public record ReviewVerifiedCreateRequest(
            String token,
            Integer rating,
            String comment,
            java.util.List<Map<String, String>> media) {
    }
}
