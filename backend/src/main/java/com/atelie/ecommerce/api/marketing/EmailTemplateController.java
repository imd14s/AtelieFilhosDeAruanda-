package com.atelie.ecommerce.api.marketing;

import com.atelie.ecommerce.domain.marketing.model.AutomationType;
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

    @PostMapping
    public ResponseEntity<EmailTemplate> create(@RequestBody EmailTemplate template) {
        if (template.getSlug() == null || template.getSlug().trim().isEmpty()) {
            // Se vier sem slug mas com automationType, usa o nome do enum como slug
            if (template.getAutomationType() != null) {
                template.setSlug(template.getAutomationType().name());
            } else {
                return ResponseEntity.badRequest().build();
            }
        }

        // Se vier com slug mas sem automationType, tenta mapear
        if (template.getAutomationType() == null) {
            try {
                template.setAutomationType(AutomationType.valueOf(template.getSlug().toUpperCase()));
            } catch (Exception e) {
                // Se não for um tipo de automação válido, permite salvar apenas como slug (ex:
                // newsletters manuais)
            }
        }

        template.setId(null);
        return ResponseEntity.ok(repository.save(template));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmailTemplate> update(@PathVariable UUID id, @RequestBody EmailTemplate template) {
        return repository.findById(id).map(existing -> {
            existing.setName(template.getName());
            existing.setSubject(template.getSubject());
            existing.setContent(template.getContent());
            existing.setSignatureId(template.getSignatureId());
            existing.setAutomationType(template.getAutomationType());
            existing.setActive(template.isActive());

            // Sincronizar slug com automationType se um deles for alterado
            if (template.getAutomationType() != null) {
                existing.setSlug(template.getAutomationType().name());
            } else if (template.getSlug() != null) {
                existing.setSlug(template.getSlug().toUpperCase());
                try {
                    existing.setAutomationType(AutomationType.valueOf(template.getSlug().toUpperCase()));
                } catch (Exception e) {
                    // Slug manual
                }
            }
            return ResponseEntity.ok(repository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
