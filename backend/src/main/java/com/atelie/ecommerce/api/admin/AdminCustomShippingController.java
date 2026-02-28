package com.atelie.ecommerce.api.admin;

import com.atelie.ecommerce.application.service.shipping.CustomShippingRegionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/providers/{providerId}/ceps")
public class AdminCustomShippingController {

    private final CustomShippingRegionService service;

    public AdminCustomShippingController(CustomShippingRegionService service) {
        this.service = service;
    }

    @PostMapping("/chunk")
    public ResponseEntity<Map<String, Object>> uploadCepsChunk(
            @PathVariable UUID providerId,
            @RequestBody List<String> ceps) {
        service.processCepChunk(providerId, ceps);
        return ResponseEntity.ok(Map.of(
                "message", "Chunk processado com sucesso.",
                "migradas", ceps.size()));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Map<String, Object>> clearCeps(@PathVariable UUID providerId) {
        service.clearCeps(providerId);
        return ResponseEntity.ok(Map.of("message", "CEPs antigos removidos com sucesso."));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> countCeps(@PathVariable UUID providerId) {
        long totalCeps = service.countCepsByProvider(providerId);
        return ResponseEntity.ok(Map.of("totalCeps", totalCeps));
    }
}
