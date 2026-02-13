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
    public boolean isEnabled() {
        return enabled;
    }

    public boolean getEnabled() {
        return enabled;
    }

    // Explicit getters for build compatibility
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ServiceType getServiceType() {
        return serviceType;
    }

    public void setServiceType(ServiceType serviceType) {
        this.serviceType = serviceType;
    }

    public String getProviderCode() {
        return providerCode;
    }

    public void setProviderCode(String providerCode) {
        this.providerCode = providerCode;
    }

    public int getPriority() {
        return priority;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }

    public String getMatchJson() {
        return matchJson;
    }

    public void setMatchJson(String matchJson) {
        this.matchJson = matchJson;
    }

    public String getBehaviorJson() {
        return behaviorJson;
    }

    public void setBehaviorJson(String behaviorJson) {
        this.behaviorJson = behaviorJson;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
