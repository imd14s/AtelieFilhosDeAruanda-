package com.atelie.ecommerce.application.service.cart;

import com.atelie.ecommerce.application.common.exception.BusinessException;
import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import com.atelie.ecommerce.infrastructure.persistence.cart.CartEntity;
import com.atelie.ecommerce.infrastructure.persistence.cart.CartItemEntity;
import com.atelie.ecommerce.infrastructure.persistence.cart.CartItemRepository;
import com.atelie.ecommerce.infrastructure.persistence.cart.CartRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;

    @Transactional
    public CartEntity getCartByUserId(UUID userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserEntity user = userRepository.findById(userId)
                            .orElseThrow(() -> new BusinessException("Usuário não encontrado: " + userId));
                    CartEntity newCart = new CartEntity();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }

    @Transactional
    public CartEntity syncCart(UUID userId, List<Map<String, Object>> items) {
        CartEntity cart = getCartByUserId(userId);

        // Limpa itens atuais para substituir pelos sincronizados (estratégia simples de
        // replace)
        cart.getItems().clear();
        cartRepository.saveAndFlush(cart);

        for (Map<String, Object> itemData : items) {
            UUID productId = UUID.fromString((String) itemData.get("id"));
            Object variantIdObj = itemData.get("variantId");
            UUID variantId = (variantIdObj != null && !variantIdObj.toString().isBlank())
                    ? UUID.fromString(variantIdObj.toString())
                    : null;
            Integer quantity = (Integer) itemData.get("quantity");

            CartItemEntity item = CartItemEntity.builder()
                    .cart(cart)
                    .product(productRepository.findById(productId)
                            .orElseThrow(() -> new BusinessException("Produto não encontrado: " + productId)))
                    .variant(variantId != null ? variantRepository.findById(variantId).orElse(null) : null)
                    .quantity(quantity)
                    .build();

            cart.getItems().add(item);
        }

        return cartRepository.save(cart);
    }

    @Transactional
    public void clearCart(UUID userId) {
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
        });
    }
}
