package com.atelie.ecommerce.api.fiscal;

import com.atelie.ecommerce.application.dto.fiscal.CertificateInfoResponse;
import com.atelie.ecommerce.application.service.fiscal.CertificateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/fiscal/certificate")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @GetMapping("/info")
    public ResponseEntity<CertificateInfoResponse> getInfo() {
        CertificateInfoResponse info = certificateService.getMetadata();
        if (info == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(info);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("password") String password) {
        try {
            CertificateInfoResponse response = certificateService.upload(file.getBytes(), password);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Falha no upload do certificado digital", e);
            return ResponseEntity.badRequest().body(java.util.Map.of("message",
                    e.getMessage() != null ? e.getMessage() : "Erro desconhecido ao processar o certificado."));
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> revoke() {
        certificateService.revoke();
        return ResponseEntity.noContent().build();
    }
}
