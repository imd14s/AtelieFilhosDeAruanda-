package com.atelie.ecommerce.infrastructure.persistence.service.model;

import com.atelie.ecommerce.domain.service.model.ServiceType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "service_providers", uniqueConstraints = @UniqueConstraint(name = "ux_service_providers_type_code", columnNames = {
        "service_type", "code" }))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceProviderEntity {

    @Id
    private UUID id;

    @Column(name = "service_type", nullable = false, length = 40)
    @Enumerated(EnumType.STRING)
    private ServiceType serviceType;

    @Column(name = "code", nullable = false, length = 80)
    private String code;

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;

    @Column(name = "priority", nullable = false)
    private int priority;

    @Column(name = "driver_key", nullable = false, length = 160)
    private String driverKey;

    @Column(name = "health_enabled", nullable = false)
    private boolean healthEnabled;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // BLINDAGEM: Garante todos os padrões de getter possíveis
    public UUID getId() {
        return id;
    }

    public com.atelie.ecommerce.domain.service.model.ServiceType getServiceType() {
        return serviceType;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public boolean getEnabled() {
        return enabled;
    }

    public int getPriority() {
        return priority;
    }

    public String getDriverKey() {
        return driverKey;
    }

    public boolean isHealthEnabled() {
        return healthEnabled;
    }

    public boolean getHealthEnabled() {
        return healthEnabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public void setServiceType(ServiceType serviceType) {
        this.serviceType = serviceType;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }

    public void setDriverKey(String driverKey) {
        this.driverKey = driverKey;
    }

    public void setHealthEnabled(boolean healthEnabled) {
        this.healthEnabled = healthEnabled;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
