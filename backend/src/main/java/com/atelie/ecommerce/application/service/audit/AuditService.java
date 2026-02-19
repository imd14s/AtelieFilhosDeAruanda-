package com.atelie.ecommerce.application.service.audit;

import com.atelie.ecommerce.infrastructure.persistence.audit.AuditLogRepository;
import com.atelie.ecommerce.infrastructure.persistence.audit.entity.AuditAction;
import com.atelie.ecommerce.infrastructure.persistence.audit.entity.AuditLogEntity;
import com.atelie.ecommerce.infrastructure.persistence.audit.entity.AuditResource;
import com.atelie.ecommerce.infrastructure.security.UserPrincipal;
import com.atelie.ecommerce.infrastructure.tenant.TenantContext;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Retenção de logs: Deleta registros mais antigos que 90 dias.
     * Roda todo dia à meia-noite.
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void cleanupOldLogs() {
        LocalDateTime limitDate = LocalDateTime.now().minusDays(90);
        long deletedCount = auditLogRepository.deleteByTimestampBefore(limitDate);
        System.out.println(">>> AUDIT CLEANUP: Deletados " + deletedCount + " logs mais antigos que 90 dias.");
    }

    public void log(AuditAction action, AuditResource resource, String resourceId, String details) {
        String userId = "system";
        String userName = "System";
        String userEmail = "system@atelie.com";

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal user) {
            userId = user.getId();
            userName = user.getName();
            userEmail = user.getEmail();
        }

        AuditLogEntity log = AuditLogEntity.builder()
                .action(action)
                .resource(resource)
                .resourceId(resourceId)
                .details(details)
                .performedByUserId(userId)
                .performedByUserName(userName)
                .performedByUserEmail(userEmail)
                .tenantId(TenantContext.getTenant())
                .timestamp(Instant.now())
                .build();

        repository.save(log);
    }

    public List<AuditLogEntity> findAll() {
        return repository.findAll(); // In a real app, this should be paginated
    }
}
