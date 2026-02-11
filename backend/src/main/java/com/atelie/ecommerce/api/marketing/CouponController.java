package com.atelie.ecommerce.api.marketing;

import com.atelie.ecommerce.domain.marketing.model.Coupon;
import com.atelie.ecommerce.infrastructure.persistence.marketing.CouponRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
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
            existing.setActive(details.getActive());
            // Se tiver datas de expiração etc. no seu model, adicione aqui.
            return ResponseEntity.ok(repository.save(existing));
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
