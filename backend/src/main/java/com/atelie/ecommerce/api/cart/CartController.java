package com.atelie.ecommerce.api.cart;

import com.atelie.ecommerce.application.service.cart.CartService;
import com.atelie.ecommerce.infrastructure.persistence.cart.CartEntity;
import com.atelie.ecommerce.infrastructure.persistence.cart.CartItemEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getCart(@PathVariable UUID userId) {
        CartEntity cart = cartService.getCartByUserId(userId);
        return ResponseEntity.ok(mapCartToResponse(cart));
    }

    @PostMapping("/{userId}/sync")
    public ResponseEntity<Map<String, Object>> syncCart(
            @PathVariable UUID userId,
            @RequestBody List<Map<String, Object>> items) {
        CartEntity cart = cartService.syncCart(userId, items);
        return ResponseEntity.ok(mapCartToResponse(cart));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> clearCart(@PathVariable UUID userId) {
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> mapCartToResponse(CartEntity cart) {
        return Map.of(
                "id", cart.getId(),
                "items", cart.getItems().stream().map(item -> Map.of(
                        "id", item.getProduct().getId(),
                        "name", item.getProduct().getName(),
                        "price", item.getProduct().getPrice(),
                        "image", item.getProduct().getImageUrl() != null ? item.getProduct().getImageUrl() : "",
                        "quantity", item.getQuantity(),
                        "variantId", item.getVariant() != null ? item.getVariant().getId().toString() : ""))
                        .collect(Collectors.toList()));
    }
}
