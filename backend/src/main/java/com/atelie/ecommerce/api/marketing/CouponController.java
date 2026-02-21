package com.atelie.ecommerce.api.marketing;

import com.atelie.ecommerce.domain.marketing.model.Coupon;
import com.atelie.ecommerce.infrastructure.persistence.marketing.CouponRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/marketing/coupons")
public class CouponController {

    private final CouponRepository repository;

    public CouponController(CouponRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<Coupon>> getAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<Coupon> create(@RequestBody Coupon coupon) {
        if (repository.findByCode(coupon.getCode()).isPresent()) {
            return ResponseEntity.badRequest().build(); // Code already exists
        }
        Coupon saved = repository.save(coupon);
        return ResponseEntity.created(URI.create("/api/marketing/coupons/" + saved.getId())).body(saved);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Coupon> updateStatus(@PathVariable UUID id, @RequestBody Map<String, Boolean> payload) {
        return repository.findById(id).map(coupon -> {
            if (payload.containsKey("active")) {
                coupon.setActive(payload.get("active"));
            }
            return ResponseEntity.ok(repository.save(coupon));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Coupon> update(@PathVariable UUID id, @RequestBody Coupon details) {
        return repository.findById(id).map(existing -> {
            existing.setCode(details.getCode());
            existing.setType(details.getType());
            existing.setValue(details.getValue());
            existing.setUsageLimit(details.getUsageLimit());
            existing.setUsageLimitPerUser(details.getUsageLimitPerUser());
            existing.setMinPurchaseValue(details.getMinPurchaseValue());
            existing.setStartDate(details.getStartDate());
            existing.setEndDate(details.getEndDate());
            existing.setOwnerId(details.getOwnerId());
            existing.setActive(details.getActive());
            return ResponseEntity.ok(repository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-coupons")
    public ResponseEntity<List<Coupon>> getMyCoupons(@RequestParam UUID userId) {
        return ResponseEntity.ok(repository.findByOwnerIdOrOwnerIdIsNullAndActiveTrue(userId));
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validate(@RequestBody Map<String, Object> request) {
        String code = (String) request.get("code");
        UUID userId = UUID.fromString((String) request.get("userId"));
        BigDecimal cartTotal = new BigDecimal(request.get("cartTotal").toString());

        return repository.findByCode(code).map(coupon -> {
            // 1. Expiry
            if (coupon.getEndDate() != null && coupon.getEndDate().isBefore(java.time.LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Este cupom expirou."));
            }
            // 2. Total Usage Limit
            if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Este cupom atingiu o limite de uso."));
            }
            // 3. Min Purchase
            if (coupon.getMinPurchaseValue() != null && cartTotal.compareTo(coupon.getMinPurchaseValue()) < 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Valor mínimo para este cupom: R$ " + coupon.getMinPurchaseValue()));
            }
            // 4. Ownership
            if (coupon.getOwnerId() != null && !userId.equals(coupon.getOwnerId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Este cupom não está disponível para você."));
            }

            // Success
            return ResponseEntity.ok(coupon);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
