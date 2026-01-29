package com.atelie.ecommerce.api.admin;

import com.atelie.ecommerce.infrastructure.persistence.service.jpa.ServiceRoutingRuleJpaRepository;
import com.atelie.ecommerce.infrastructure.persistence.service.model.ServiceRoutingRuleEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/rules")
public class AdminRuleController {

    private final ServiceRoutingRuleJpaRepository repository;
    private final ExpressionParser parser = new SpelExpressionParser();
    private final ObjectMapper mapper = new ObjectMapper();

    public AdminRuleController(ServiceRoutingRuleJpaRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ServiceRoutingRuleEntity> list(@RequestParam(required = false) String type) {
        if (type != null) {
            return repository.findByServiceTypeAndEnabledOrderByPriorityAsc(type, true);
        }
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ServiceRoutingRuleEntity entity) {
        try {
            validateSpel(entity.getMatchJson());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Regra Inválida: " + e.getMessage());
        }

        if (entity.getId() == null) entity.setId(UUID.randomUUID());
        entity.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(repository.save(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody ServiceRoutingRuleEntity entity) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();

        try {
            validateSpel(entity.getMatchJson());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Regra Inválida: " + e.getMessage());
        }

        entity.setId(id);
        entity.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(repository.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void validateSpel(String json) {
        try {
            if (json == null || json.isBlank()) return;
            JsonNode root = mapper.readTree(json);
            if (root.hasNonNull("expression")) {
                String expr = root.get("expression").asText();
                // Tenta fazer parse. Se a sintaxe for inválida, lança SpelParseException
                parser.parseExpression(expr);
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Erro de Sintaxe SpEL ou JSON: " + e.getMessage());
        }
    }
}
