package com.atelie.ecommerce.api.health;

import com.atelie.ecommerce.application.service.health.HealthService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * HealthController.
 *
 * Endpoint de healthcheck da API.
 * Padrão produção:
 * - Endpoint oficial: /api/health
 * - Endpoint legado (compat): /health (mantido, mas deprecated)
 */
@RestController
public class HealthController {

    private static final MediaType TEXT_PLAIN_UTF8 =
            MediaType.parseMediaType("text/plain;charset=UTF-8");

    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    /**
     * Endpoint oficial (produção).
     *
     * @return status textual (ex.: "OK")
     */
    @GetMapping(value = "/api/health", produces = "text/plain;charset=UTF-8")
    public ResponseEntity<String> apiHealth() {
        return ResponseEntity.ok()
                .contentType(TEXT_PLAIN_UTF8)
                .body(healthService.getStatus());
    }

    /**
     * Endpoint legado (compatibilidade).
     *
     * @deprecated manter até clientes migrarem para /api/health
     * @return status textual (ex.: "OK")
     */
    @Deprecated
    @GetMapping(value = "/health", produces = "text/plain;charset=UTF-8")
    public ResponseEntity<String> legacyHealth() {
        return ResponseEntity.ok()
                .contentType(TEXT_PLAIN_UTF8)
                .body(healthService.getStatus());
    }
}
