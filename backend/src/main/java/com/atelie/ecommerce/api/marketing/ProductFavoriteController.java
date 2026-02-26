package com.atelie.ecommerce.api.marketing;

import com.atelie.ecommerce.infrastructure.persistence.marketing.ProductFavoriteRepository;
import com.atelie.ecommerce.infrastructure.persistence.marketing.entity.ProductFavoriteEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.atelie.ecommerce.api.marketing.dto.FavoriteRankingDTO;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/favorites")
public class ProductFavoriteController {

    private final ProductFavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ProductFavoriteController(ProductFavoriteRepository favoriteRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.favoriteRepository = favoriteRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/user/{userId}")
    public List<ProductFavoriteEntity> getMyFavorites(@PathVariable UUID userId) {
        return favoriteRepository.findByUserId(userId);
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<FavoriteRankingDTO>> getRanking() {
        List<FavoriteRankingDTO> ranking = favoriteRepository.findFavoriteRanking().stream()
                .map(p -> new FavoriteRankingDTO(p.getProductId(), p.getProductName(), p.getProductImage(),
                        p.getProductPrice(), p.getFavCount()))
                .collect(java.util.stream.Collectors.toList());

        List<FavoriteRankingDTO> enhancedRanking = ranking.stream().map(dto -> {
            if (dto.productImage() == null || dto.productImage().isBlank()) {
                return productRepository.findById(dto.productId())
                        .map(p -> new FavoriteRankingDTO(
                                dto.productId(),
                                dto.productName(),
                                (p.getImages() != null && !p.getImages().isEmpty()) ? p.getImages().get(0) : null,
                                dto.productPrice(),
                                dto.favCount()))
                        .orElse(dto);
            }
            return dto;
        }).toList();

        return ResponseEntity.ok(enhancedRanking);
    }

    @PostMapping
    public ResponseEntity<?> addFavorite(@RequestBody FavoriteRequest request) {
        var product = productRepository.findById(request.productId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        var user = userRepository.findById(request.userId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        var favorite = ProductFavoriteEntity.builder()
                .id(new ProductFavoriteEntity.FavoriteId(request.userId(), request.productId()))
                .product(product)
                .user(user)
                .build();

        return ResponseEntity.ok(favoriteRepository.save(favorite));
    }

    @DeleteMapping
    public ResponseEntity<Void> removeFavorite(@RequestParam UUID userId, @RequestParam UUID productId) {
        favoriteRepository.deleteById(new ProductFavoriteEntity.FavoriteId(userId, productId));
        return ResponseEntity.noContent().build();
    }

    public record FavoriteRequest(UUID userId, UUID productId) {
    }
}
