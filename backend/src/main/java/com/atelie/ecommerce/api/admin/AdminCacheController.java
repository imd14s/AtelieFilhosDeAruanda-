package com.atelie.ecommerce.api.admin;

import com.atelie.ecommerce.domain.common.event.EntityChangedEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/cache")
public class AdminCacheController {

    private final ApplicationEventPublisher eventPublisher;

    public AdminCacheController(ApplicationEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refreshAll() {
        // Dispara um evento global que todos os Gateways e o ConfigService ouvem
        eventPublisher.publishEvent(new EntityChangedEvent(this, "MANUAL_GLOBAL_REFRESH"));

        return ResponseEntity.ok(Map.of(
                "ok", true,
                "message", "Evento de atualização disparado para todos os listeners de cache."
        ));
    }
}
