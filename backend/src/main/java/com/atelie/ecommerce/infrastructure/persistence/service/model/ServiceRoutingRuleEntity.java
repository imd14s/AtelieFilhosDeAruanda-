package com.atelie.ecommerce.infrastructure.persistence.service.model;

import com.atelie.ecommerce.domain.service.model.ServiceType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "service_routing_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRoutingRuleEntity {

    @Id
    private UUID id;

    @Column(name = "service_type", nullable = false, length = 40)
    @Enumerated(EnumType.STRING)
    private ServiceType serviceType;

    @Column(name = "provider_code", nullable = false, length = 80)
    private String providerCode;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;

    @Column(name = "priority", nullable = false)
    private int priority;

    @Column(name = "match_json", nullable = false, columnDefinition = "jsonb")
    private String matchJson;

    @Column(name = "behavior_json", columnDefinition = "jsonb")
    private String behaviorJson;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // BLINDAGEM: Garante que tanto isEnabled() quanto getEnabled() existam
    public boolean isEnabled() { return enabled; }
    public boolean getEnabled() { return enabled; }
}
