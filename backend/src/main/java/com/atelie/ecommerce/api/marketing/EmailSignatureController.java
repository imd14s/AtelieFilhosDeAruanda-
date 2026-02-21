package com.atelie.ecommerce.api.marketing;

import com.atelie.ecommerce.application.service.marketing.EmailSignatureService;
import com.atelie.ecommerce.domain.marketing.model.EmailSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/marketing/signatures")
public class EmailSignatureController {

    private static final Logger logger = LoggerFactory.getLogger(EmailSignatureController.class);
    private final EmailSignatureService service;

    public EmailSignatureController(EmailSignatureService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<EmailSignature> save(@RequestBody EmailSignature signature) {
        try {
            return ResponseEntity.ok(service.save(signature));
        } catch (Exception e) {
            logger.error("Erro ao salvar assinatura", e);
            throw e;
        }
    }

    @GetMapping
    public ResponseEntity<List<EmailSignature>> listAll() {
        try {
            return ResponseEntity.ok(service.findAll());
        } catch (Exception e) {
            logger.error("Erro ao listar assinaturas", e);
            throw e;
        }
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
