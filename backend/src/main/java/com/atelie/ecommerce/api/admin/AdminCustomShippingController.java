package com.atelie.ecommerce.api.admin;

import com.atelie.ecommerce.application.service.shipping.CustomShippingRegionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/providers/{providerId}/ceps")
public class AdminCustomShippingController {

    private final CustomShippingRegionService service;

    public AdminCustomShippingController(CustomShippingRegionService service) {
        this.service = service;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadCeps(
            @PathVariable UUID providerId,
            @RequestParam("file") MultipartFile file) {
        service.processCsvUpload(providerId, file);
        long totalCeps = service.countCepsByProvider(providerId);
        return ResponseEntity.ok(Map.of(
                "message", "CEPs processados com sucesso.",
                "totalCeps", totalCeps));
    }

    @GetMapping("/count")
    public ResponseEntity<Map<String, Object>> countCeps(@PathVariable UUID providerId) {
        long totalCeps = service.countCepsByProvider(providerId);
        return ResponseEntity.ok(Map.of("totalCeps", totalCeps));
    }
}
