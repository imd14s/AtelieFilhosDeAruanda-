package com.atelie.ecommerce.infrastructure.persistence.provider;

import jakarta.persistence.*;
import lombok.*;

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
    private String serviceType;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;

    @Column(name = "priority", nullable = false)
    private int priority;

    @Lob
    @Column(name = "match_json", nullable = false)
    private String matchJson;

    @Column(name = "provider_code", nullable = false, length = 80)
    private String providerCode;

    @Lob
    @Column(name = "behavior_json")
    private String behaviorJson;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
