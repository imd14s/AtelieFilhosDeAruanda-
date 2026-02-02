package com.atelie.ecommerce.api.admin;

import com.atelie.ecommerce.domain.service.model.ServiceType; // IMPORT ADICIONADO
import com.atelie.ecommerce.domain.service.port.ServiceRoutingRuleGateway;
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
    private final ServiceRoutingRuleGateway gateway;
    private final ExpressionParser parser = new SpelExpressionParser();
    private final ObjectMapper mapper = new ObjectMapper();

    public AdminRuleController(ServiceRoutingRuleJpaRepository repository, ServiceRoutingRuleGateway gateway) {
        this.repository = repository;
        this.gateway = gateway;
    }

    @GetMapping
    // CORREÇÃO: @RequestParam ServiceType type (Spring converte String->Enum auto)
    public List<ServiceRoutingRuleEntity> list(@RequestParam(required = false) ServiceType type) {
        if (type != null) {
            return repository.findByServiceTypeAndEnabledOrderByPriorityAsc(type, true);
        }
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ServiceRoutingRuleEntity entity) {
        try { validateSpel(entity.getMatchJson()); } 
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body("Regra Inválida: " + e.getMessage()); }

        if (entity.getId() == null) entity.setId(UUID.randomUUID());
        entity.setUpdatedAt(LocalDateTime.now());
        
        ServiceRoutingRuleEntity saved = repository.save(entity);
        gateway.refresh();
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody ServiceRoutingRuleEntity entity) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        try { validateSpel(entity.getMatchJson()); } 
        catch (IllegalArgumentException e) { return ResponseEntity.badRequest().body("Regra Inválida: " + e.getMessage()); }

        entity.setId(id);
        entity.setUpdatedAt(LocalDateTime.now());
        
        ServiceRoutingRuleEntity saved = repository.save(entity);
        gateway.refresh();
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        repository.deleteById(id);
        gateway.refresh();
        return ResponseEntity.noContent().build();
    }

    private void validateSpel(String json) {
        try {
            if (json == null || json.isBlank()) return;
            JsonNode root = mapper.readTree(json);
            if (root.hasNonNull("expression")) {
                String expr = root.get("expression").asText();
                parser.parseExpression(expr);
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Erro de Sintaxe SpEL ou JSON: " + e.getMessage());
        }
    }
}
