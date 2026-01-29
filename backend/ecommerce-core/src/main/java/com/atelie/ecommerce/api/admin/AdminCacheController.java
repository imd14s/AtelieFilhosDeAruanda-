package com.atelie.ecommerce.api.admin;

import com.atelie.ecommerce.api.config.DynamicConfigService;
import com.atelie.ecommerce.domain.service.port.ServiceProviderConfigGateway;
import com.atelie.ecommerce.domain.service.port.ServiceProviderGateway;
import com.atelie.ecommerce.domain.service.port.ServiceRoutingRuleGateway;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/cache")
public class AdminCacheController {

    private final DynamicConfigService dynamicConfigService;
    private final ServiceProviderGateway providerGateway;
    private final ServiceRoutingRuleGateway routingRuleGateway;
    private final ServiceProviderConfigGateway providerConfigGateway;

    public AdminCacheController(
            DynamicConfigService dynamicConfigService,
            ServiceProviderGateway providerGateway,
            ServiceRoutingRuleGateway routingRuleGateway,
            ServiceProviderConfigGateway providerConfigGateway
    ) {
        this.dynamicConfigService = dynamicConfigService;
        this.providerGateway = providerGateway;
        this.routingRuleGateway = routingRuleGateway;
        this.providerConfigGateway = providerConfigGateway;
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshAll() {
        dynamicConfigService.refresh();
        providerGateway.refresh();
        routingRuleGateway.refresh();
        providerConfigGateway.refresh();

        return ResponseEntity.ok(Map.of(
                "ok", true,
                "message", "Caches refreshed: dynamic-config + service-engine gateways"
        ));
    }
}
