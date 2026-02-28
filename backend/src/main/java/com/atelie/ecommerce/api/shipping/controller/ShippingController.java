package com.atelie.ecommerce.api.shipping.controller;

import com.atelie.ecommerce.application.service.config.DynamicConfigService;
import com.atelie.ecommerce.application.dto.shipping.ShippingQuoteRequest;
import com.atelie.ecommerce.application.dto.shipping.ShippingQuoteResponse;
import com.atelie.ecommerce.api.shipping.service.ShippingService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipping")
public class ShippingController {

    private static final Logger log = LoggerFactory.getLogger(ShippingController.class);

    private final ShippingService shippingService;
    private final DynamicConfigService dynamicConfigService;

    public ShippingController(ShippingService shippingService, DynamicConfigService dynamicConfigService) {
        this.shippingService = shippingService;
        this.dynamicConfigService = dynamicConfigService;
    }

    @PostMapping("/quote")
    public ResponseEntity<List<ShippingQuoteResponse>> quote(@Valid @RequestBody ShippingQuoteRequest req) {
        log.info("[DEBUG] Requisição de frete para o CEP: {}", req.getCep());
        try {
            List<ShippingQuoteResponse> response = shippingService.quote(req.getCep(), req.getSubtotal(),
                    req.getProvider(),
                    req.getItems());
            log.info("[DEBUG] Cálculo de frete concluído. {} opções retornadas.", response.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("[DEBUG] Erro crítico no cálculo de frete: {}", e.getMessage(), e);
            throw e;
        }
    }

    @PostMapping("/configs/refresh")
    public ResponseEntity<Void> refreshConfigs() {
        dynamicConfigService.refresh();
        return ResponseEntity.noContent().build();
    }
}
