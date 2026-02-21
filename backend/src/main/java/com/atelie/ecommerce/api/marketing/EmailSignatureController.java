package com.atelie.ecommerce.api.marketing;

import com.atelie.ecommerce.application.service.marketing.EmailSignatureService;
import com.atelie.ecommerce.domain.marketing.model.EmailSignature;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/marketing/signatures")
public class EmailSignatureController {

    private final EmailSignatureService service;

    public EmailSignatureController(EmailSignatureService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<EmailSignature> save(@RequestBody EmailSignature signature) {
        return ResponseEntity.ok(service.save(signature));
    }

    @GetMapping
    public ResponseEntity<List<EmailSignature>> listAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmailSignature> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<String> preview(@PathVariable UUID id) {
        EmailSignature sig = service.findById(id);
        return ResponseEntity.ok(service.generateHtml(sig));
    }
}
