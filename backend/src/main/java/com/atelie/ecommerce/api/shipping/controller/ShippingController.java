package com.atelie.ecommerce.api.shipping.controller;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import com.atelie.ecommerce.api.shipping.dto.ShippingQuoteRequest;
import com.atelie.ecommerce.api.shipping.dto.ShippingQuoteResponse;
import com.atelie.ecommerce.api.shipping.service.ShippingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipping")
public class ShippingController {

    private final ShippingService shippingService;
    private final DynamicConfigService dynamicConfigService;

    public ShippingController(ShippingService shippingService, DynamicConfigService dynamicConfigService) {
        this.shippingService = shippingService;
        this.dynamicConfigService = dynamicConfigService;
    }

    @PostMapping("/quote")
    public ResponseEntity<ShippingQuoteResponse> quote(@Valid @RequestBody ShippingQuoteRequest req) {
        return ResponseEntity
                .ok(shippingService.quote(req.getCep(), req.getSubtotal(), req.getProvider(), req.getItems()));
    }

    // Endpoint operacional: recarrega cache sem restart (pode depois proteger via
    // auth/admin)
    @PostMapping("/configs/refresh")
    public ResponseEntity<Void> refreshConfigs() {
        dynamicConfigService.refresh();
        return ResponseEntity.noContent().build();
    }
}
