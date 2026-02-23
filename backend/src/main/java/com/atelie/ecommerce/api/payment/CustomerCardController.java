package com.atelie.ecommerce.api.payment;

import com.atelie.ecommerce.api.common.exception.NotFoundException;
import com.atelie.ecommerce.application.service.payment.MercadoPagoCustomerClient;
import com.atelie.ecommerce.infrastructure.persistence.auth.UserRepository;
import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/cards")
public class CustomerCardController {

    private final MercadoPagoCustomerClient mpClient;
    private final UserRepository userRepository;

    public CustomerCardController(MercadoPagoCustomerClient mpClient, UserRepository userRepository) {
        this.mpClient = mpClient;
        this.userRepository = userRepository;
    }

    /**
     * Lista os cartões salvos do usuário autenticado.
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listCards(@AuthenticationPrincipal UserDetails userDetails) {
        UserEntity user = findUser(userDetails);
        String customerId = mpClient.getOrCreateCustomerId(user);
        if (customerId == null) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        List<Map<String, Object>> cards = mpClient.listCards(customerId);
        return ResponseEntity.ok(cards);
    }

    /**
     * Salva um novo cartão tokenizado (card_token gerado via MercadoPago.js no
     * frontend).
     * Body: { "token": "card_token_gerado_pelo_sdk" }
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> saveCard(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        UserEntity user = findUser(userDetails);
        String cardToken = body.get("token");
        if (cardToken == null || cardToken.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token do cartão é obrigatório."));
        }
        String customerId = mpClient.getOrCreateCustomerId(user);
        Map<String, Object> saved = mpClient.saveCard(customerId, cardToken);
        return ResponseEntity.ok(saved);
    }

    /**
     * Remove um cartão salvo.
     */
    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> deleteCard(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String cardId) {
        UserEntity user = findUser(userDetails);
        String customerId = mpClient.getOrCreateCustomerId(user);
        mpClient.deleteCard(customerId, cardId);
        return ResponseEntity.noContent().build();
    }

    private UserEntity findUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));
    }
}
