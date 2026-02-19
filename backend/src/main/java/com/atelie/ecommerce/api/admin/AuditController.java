package com.atelie.ecommerce.api.admin;

import com.atelie.ecommerce.application.service.audit.AuditService;
import com.atelie.ecommerce.infrastructure.persistence.audit.entity.AuditLogEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/audit-logs")
@Tag(name = "Auditoria", description = "Logs de auditoria do sistema")
public class AuditController {

    private final AuditService service;

    public AuditController(AuditService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Listar logs", description = "Retorna o histórico de atividades")
    public List<AuditLogResponse> list() {
        return service.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    private AuditLogResponse toResponse(AuditLogEntity entity) {
        return new AuditLogResponse(
                entity.getId().toString(),
                entity.getAction().name(),
                entity.getResource().name(),
                entity.getResourceId(),
                entity.getDetails(),
                new PerformedBy(
                        entity.getPerformedByUserId(),
                        entity.getPerformedByUserName(),
                        entity.getPerformedByUserEmail()),
                entity.getTimestamp().toString(),
                entity.getTenantId());
    }

    public record AuditLogResponse(
            String id,
            String action,
            String resource,
            String resourceId,
            String details,
            PerformedBy performedBy,
            String timestamp,
            String tenantId) {
    }

    public record PerformedBy(String id, String name, String email) {
    }
}
