package com.atelie.ecommerce.application.service.review;

import com.atelie.ecommerce.application.common.exception.BusinessException;
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
import com.atelie.ecommerce.infrastructure.persistence.review.ReviewTokenEntity;
import com.atelie.ecommerce.infrastructure.persistence.review.ReviewTokenRepository;
import com.atelie.ecommerce.infrastructure.service.media.MediaStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewTokenRepository reviewTokenRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final GeminiIntegrationService geminiIntegrationService;
    private final MediaStorageService mediaStorageService;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Transactional
    public ReviewEntity createReview(UUID userId, UUID productId, Integer rating, String comment,
            List<Map<String, String>> media) {
        validateEligibility(userId, productId);

        Map<String, Object> moderationResult = geminiIntegrationService.moderateReview(comment, media);
        boolean safe = (boolean) moderationResult.get("safe");
        BigDecimal score = (BigDecimal) moderationResult.get("score");

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

    @Transactional
    public void generateReviewTokensForOrder(OrderEntity order) {
        order.getItems().forEach(item -> {
            if (!reviewTokenRepository.existsByOrderIdAndProductId(order.getId(), item.getProduct().getId())) {
                ReviewTokenEntity token = new ReviewTokenEntity();
                token.setOrderId(order.getId());
                token.setProductId(item.getProduct().getId());
                token.setCustomerEmail(order.getCustomerEmail());
                token.setExpiryDate(LocalDateTime.now().plusDays(30));
                reviewTokenRepository.save(token);
            }
        });
    }

    public ReviewTokenEntity validateToken(String token) {
        ReviewTokenEntity tokenEntity = reviewTokenRepository.findByToken(token)
                .orElseThrow(() -> new BusinessException("Token de avaliação inválido."));

        if (tokenEntity.isUsed()) {
            throw new BusinessException("Este convite de avaliação já foi utilizado.");
        }

        if (tokenEntity.isExpired()) {
            throw new BusinessException("Este convite de avaliação expirou.");
        }

        return tokenEntity;
    }

    @Transactional
    public ReviewEntity createVerifiedReview(String token, Integer rating, String comment,
            List<MultipartFile> mediaFiles) {
        ReviewTokenEntity tokenEntity = validateToken(token);
        validateMediaConstraints(mediaFiles);
        List<Map<String, String>> mediaData = uploadMedia(mediaFiles);

        Map<String, Object> moderationResult = geminiIntegrationService.moderateReview(comment, mediaData);
        boolean safe = (boolean) moderationResult.get("safe");
        BigDecimal score = (BigDecimal) moderationResult.get("score");

        ReviewEntity review = new ReviewEntity();
        review.setOrderId(tokenEntity.getOrderId());
        review.setProduct(productRepository.findById(tokenEntity.getProductId())
                .orElseThrow(() -> new BusinessException("Produto não encontrado")));
        review.setRating(rating);
        review.setComment(comment != null && comment.length() > 300 ? comment.substring(0, 300) : comment);
        review.setAiModerationScore(score);
        review.setStatus(safe ? "APPROVED" : "REJECTED");
        review.setVerifiedPurchase(true);

        if (mediaData != null) {
            for (Map<String, String> m : mediaData) {
                ReviewMediaEntity mediaEntity = new ReviewMediaEntity();
                mediaEntity.setReview(review);
                mediaEntity.setUrl(m.get("url"));
                mediaEntity.setType(m.get("type"));
                review.getMedia().add(mediaEntity);
            }
        }

        tokenEntity.setUsed(true);
        reviewTokenRepository.save(tokenEntity);

        ReviewEntity savedReview = reviewRepository.save(review);
        if ("APPROVED".equals(savedReview.getStatus())) {
            eventPublisher.publishEvent(new com.atelie.ecommerce.application.event.ReviewApprovedEvent(
                    this, savedReview.getId(), savedReview.getUser().getId(), !savedReview.getMedia().isEmpty()));
        }

        return savedReview;
    }

    private void validateMediaConstraints(List<MultipartFile> mediaFiles) {
        if (mediaFiles == null || mediaFiles.isEmpty())
            return;

        long imageCount = mediaFiles.stream()
                .filter(f -> f.getContentType() != null && f.getContentType().startsWith("image/")).count();
        long videoCount = mediaFiles.stream()
                .filter(f -> f.getContentType() != null && f.getContentType().startsWith("video/")).count();

        if (videoCount > 1) {
            throw new BusinessException("Você pode enviar apenas 1 vídeo por avaliação.");
        }
        if (videoCount == 1 && imageCount > 0) {
            throw new BusinessException(
                    "Não é permitido enviar fotos e vídeos simultaneamente. Escolha até 3 fotos OU 1 vídeo.");
        }
        if (imageCount > 3) {
            throw new BusinessException("Você pode enviar no máximo 3 fotos por avaliação.");
        }

        for (MultipartFile file : mediaFiles) {
            String ct = file.getContentType();
            if (ct == null || (!ct.equals("image/jpeg") && !ct.equals("image/png") && !ct.equals("video/mp4"))) {
                throw new BusinessException("Tipo de arquivo não permitido: " + ct + ". Use apenas JPG, PNG ou MP4.");
            }
        }
    }

    private List<Map<String, String>> uploadMedia(List<MultipartFile> mediaFiles) {
        if (mediaFiles == null || mediaFiles.isEmpty())
            return List.of();

        return mediaFiles.stream().map(file -> {
            String url = mediaStorageService.storeImage(file);
            String type = file.getContentType().startsWith("video/") ? "VIDEO" : "IMAGE";
            return Map.of("url", url, "type", type);
        }).toList();
    }

    public List<ReviewTokenEntity> getPendingTokensForOrder(UUID orderId) {
        return reviewTokenRepository.findAll().stream()
                .filter(t -> t.getOrderId().equals(orderId) && !t.isUsed() && !t.isExpired())
                .toList();
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
        List<OrderEntity> orders = orderRepository.findAll().stream()
                .filter(o -> o.getUser() != null && o.getUser().getId().equals(userId)
                        && "DELIVERED".equals(o.getStatus()))
                .toList();

        List<UUID> purchasedProductIds = orders.stream()
                .flatMap(o -> o.getItems().stream())
                .map(i -> i.getProduct().getId())
                .distinct()
                .toList();

        List<UUID> reviewedProductIds = reviewRepository.findByUserId(userId).stream()
                .map(r -> r.getProduct().getId())
                .toList();

        List<UUID> pendingProductIds = purchasedProductIds.stream()
                .filter(id -> !reviewedProductIds.contains(id))
                .toList();

        return productRepository.findAllById(pendingProductIds);
    }

    @Transactional
    public ReviewEntity moderateReview(UUID id, String status) {
        ReviewEntity review = reviewRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Avaliação não encontrada"));

        if (!List.of("APPROVED", "REJECTED", "PENDING").contains(status)) {
            throw new BusinessException("Status de moderação inválido");
        }

        String oldStatus = review.getStatus();
        review.setStatus(status);
        ReviewEntity savedReview = reviewRepository.save(review);

        if ("APPROVED".equals(status) && !"APPROVED".equals(oldStatus) && review.isVerifiedPurchase()) {
            eventPublisher.publishEvent(new com.atelie.ecommerce.application.event.ReviewApprovedEvent(
                    this, savedReview.getId(), savedReview.getUser().getId(), !savedReview.getMedia().isEmpty()));
        }

        return savedReview;
    }

    @Transactional
    public void batchModerate(List<UUID> ids, String status) {
        List<ReviewEntity> reviews = reviewRepository.findAllById(ids);
        for (ReviewEntity r : reviews) {
            String oldStatus = r.getStatus();
            r.setStatus(status);
            if ("APPROVED".equals(status) && !"APPROVED".equals(oldStatus) && r.isVerifiedPurchase()) {
                eventPublisher.publishEvent(new com.atelie.ecommerce.application.event.ReviewApprovedEvent(
                        this, r.getId(), r.getUser().getId(), !r.getMedia().isEmpty()));
            }
        }
        reviewRepository.saveAll(reviews);
    }

    @Transactional
    public ReviewEntity respondToReview(UUID id, String responseText) {
        ReviewEntity review = reviewRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Avaliação não encontrada"));

        review.setAdminResponse(responseText);
        review.setRespondedAt(LocalDateTime.now());
        return reviewRepository.save(review);
    }

    public Page<ReviewEntity> getReviewsForAdmin(String status, List<Integer> ratings, Boolean hasMedia,
            Pageable pageable) {
        if (status != null) {
            return reviewRepository.findAllByStatusOrderByCreatedAtDesc(status, pageable);
        }
        if (ratings != null && !ratings.isEmpty()) {
            return reviewRepository.findAllByRatingInOrderByCreatedAtDesc(ratings, pageable);
        }
        if (Boolean.TRUE.equals(hasMedia)) {
            return reviewRepository.findAllWithMediaOrderByCreatedAtDesc(pageable);
        }
        return reviewRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
