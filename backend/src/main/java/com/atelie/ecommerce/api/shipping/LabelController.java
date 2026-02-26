package com.atelie.ecommerce.api.shipping;

import com.atelie.ecommerce.application.service.shipping.ShippingLabelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/labels")
@RequiredArgsConstructor
public class LabelController {

    private final ShippingLabelService shippingLabelService;

    @PostMapping("/{orderId}/generate")
    public ResponseEntity<Void> generateLabel(@PathVariable UUID orderId) {
        shippingLabelService.generateLabelForOrder(orderId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{orderId}/cancel")
    public ResponseEntity<Void> cancelLabel(@PathVariable UUID orderId, @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "Cancelamento manual via admin");
        shippingLabelService.cancelLabel(orderId, reason);
        return ResponseEntity.ok().build();
    }
}
