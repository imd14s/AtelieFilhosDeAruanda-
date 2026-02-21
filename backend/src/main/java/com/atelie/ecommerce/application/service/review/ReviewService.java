package com.atelie.ecommerce.application.service.review;

import com.atelie.ecommerce.api.common.exception.BusinessException;
import com.atelie.ecommerce.application.service.ai.GeminiIntegrationService;
import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderItemEntity;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.review.ReviewEntity;
import com.atelie.ecommerce.infrastructure.persistence.review.ReviewMediaEntity;
import com.atelie.ecommerce.infrastructure.persistence.review.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final GeminiIntegrationService geminiIntegrationService;

    @Transactional
    public ReviewEntity createReview(UUID userId, UUID productId, Integer rating, String comment,
            List<Map<String, String>> media) {
        // 1. Check eligibility
        validateEligibility(userId, productId);

        // 2. AI Moderation
        Map<String, Object> moderationResult = geminiIntegrationService.moderateReview(comment, media);
        boolean safe = (boolean) moderationResult.get("safe");
        BigDecimal score = (BigDecimal) moderationResult.get("score");

        // 3. Create Review
        ReviewEntity review = new ReviewEntity();
        UserEntity user = new UserEntity();
        user.setId(userId);

        review.setUser(user);
        review.setProduct(productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException("Produto não encontrado")));
        review.setRating(rating);
        review.setComment(comment != null && comment.length() > 300 ? comment.substring(0, 300) : comment);
        review.setAiModerationScore(score);
        review.setStatus(safe ? "APPROVED" : "REJECTED");

        if (media != null && media.size() > 5) {
            throw new BusinessException("Máximo de 5 mídias por avaliação.");
        }

        if (media != null) {
            for (Map<String, String> m : media) {
                ReviewMediaEntity mediaEntity = new ReviewMediaEntity();
                mediaEntity.setReview(review);
                mediaEntity.setUrl(m.get("url"));
                mediaEntity.setType(m.get("type"));
                review.getMedia().add(mediaEntity);
            }
        }

        return reviewRepository.save(review);
    }

    private void validateEligibility(UUID userId, UUID productId) {
        boolean eligible = orderRepository.existsByUserIdAndStatusAndProductId(userId, "DELIVERED", productId);
        if (!eligible) {
            throw new BusinessException("Você só pode avaliar produtos que já recebeu.");
        }
    }

    public List<ReviewEntity> getProductReviews(UUID productId) {
        return reviewRepository.findByProductIdAndStatus(productId, "APPROVED");
    }

    public List<ReviewEntity> getUserReviews(UUID userId) {
        return reviewRepository.findByUserId(userId);
    }

    public List<ProductEntity> getPendingReviews(UUID userId) {
        // Find all unique products from DELIVERED orders
        List<OrderEntity> orders = orderRepository.findAll().stream()
                .filter(o -> o.getUser() != null && o.getUser().getId().equals(userId)
                        && "DELIVERED".equals(o.getStatus()))
                .toList();

        List<UUID> purchasedProductIds = orders.stream()
                .flatMap(o -> o.getItems().stream())
                .map(i -> i.getProduct().getId())
                .distinct()
                .toList();

        // Find reviewed product IDs
        List<UUID> reviewedProductIds = reviewRepository.findByUserId(userId).stream()
                .map(r -> r.getProduct().getId())
                .toList();

        // Filter out reviewed products
        List<UUID> pendingProductIds = purchasedProductIds.stream()
                .filter(id -> !reviewedProductIds.contains(id))
                .toList();

        return productRepository.findAllById(pendingProductIds);
    }
}
