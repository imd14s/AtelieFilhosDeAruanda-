package com.atelie.ecommerce.api.admin.review;

import com.atelie.ecommerce.application.service.review.ReviewService;
import com.atelie.ecommerce.infrastructure.persistence.review.ReviewEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ReviewAdminController {

    private final ReviewService reviewService;

    @GetMapping
    public ResponseEntity<Page<ReviewEntity>> getReviews(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) List<Integer> ratings,
            @RequestParam(required = false) Boolean hasMedia,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(reviewService.getReviewsForAdmin(
                status, ratings, hasMedia, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ReviewEntity> moderateReview(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(reviewService.moderateReview(id, body.get("status")));
    }

    @PostMapping("/{id}/response")
    public ResponseEntity<ReviewEntity> respondToReview(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(reviewService.respondToReview(id, body.get("response")));
    }

    @PostMapping("/batch-moderate")
    public ResponseEntity<Void> batchModerate(@RequestBody BatchModerateRequest request) {
        reviewService.batchModerate(request.ids(), request.status());
        return ResponseEntity.noContent().build();
    }

    public record BatchModerateRequest(List<UUID> ids, String status) {
    }
}
