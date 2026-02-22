package com.atelie.ecommerce.api.marketing;

import com.atelie.ecommerce.domain.marketing.model.EmailTemplate;
import com.atelie.ecommerce.infrastructure.persistence.marketing.EmailTemplateRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/marketing/email-templates")
public class EmailTemplateController {

    private final EmailTemplateRepository repository;

    public EmailTemplateController(EmailTemplateRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<EmailTemplate>> listAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmailTemplate> getById(@PathVariable UUID id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmailTemplate> update(@PathVariable UUID id, @RequestBody EmailTemplate template) {
        return repository.findById(id).map(existing -> {
            existing.setName(template.getName());
            existing.setSubject(template.getSubject());
            existing.setContent(template.getContent());
            existing.setSignatureId(template.getSignatureId());
            existing.setActive(template.isActive());
            return ResponseEntity.ok(repository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }
}
