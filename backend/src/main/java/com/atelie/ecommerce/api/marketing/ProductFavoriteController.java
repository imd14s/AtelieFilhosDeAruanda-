package com.atelie.ecommerce.api.marketing;

import com.atelie.ecommerce.infrastructure.persistence.marketing.ProductFavoriteRepository;
import com.atelie.ecommerce.infrastructure.persistence.marketing.entity.ProductFavoriteEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
