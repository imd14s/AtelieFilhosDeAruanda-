package com.atelie.ecommerce.api.fiscal;

import com.atelie.ecommerce.api.fiscal.dto.CertificateInfoResponse;
import com.atelie.ecommerce.application.service.fiscal.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    public ResponseEntity<CertificateInfoResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("password") String password) {
        try {
            CertificateInfoResponse response = certificateService.upload(file.getBytes(), password);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> revoke() {
        certificateService.revoke();
        return ResponseEntity.noContent().build();
    }
}
