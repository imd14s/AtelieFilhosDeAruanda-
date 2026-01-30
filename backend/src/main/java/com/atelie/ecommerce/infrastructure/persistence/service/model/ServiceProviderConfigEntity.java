package com.atelie.ecommerce.infrastructure.persistence.service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "service_provider_configs")
public class ServiceProviderConfigEntity {

    @Id
    private UUID id;

    @Column(name = "provider_id")
    private UUID providerId; // opcional (DB pode usar provider_id). Nosso teste usa providerCode.

    @Column(name = "environment", nullable = false, length = 20)
    private String environment;

    @Column(name = "secrets_ref", length = 200)
    private String secretsRef;

    @Column(name = "config_json", nullable = false, columnDefinition = "jsonb")
    private String configJson;

    @Column(name = "version", nullable = false)
    private int version;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Campo auxiliar (não existe no schema original) -> não mapear.
    @jakarta.persistence.Transient
    private String providerCode;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getProviderId() { return providerId; }
    public void setProviderId(UUID providerId) { this.providerId = providerId; }

    public String getEnvironment() { return environment; }
    public void setEnvironment(String environment) { this.environment = environment; }

    public String getSecretsRef() { return secretsRef; }
    public void setSecretsRef(String secretsRef) { this.secretsRef = secretsRef; }

    public String getConfigJson() { return configJson; }
    public void setConfigJson(String configJson) { this.configJson = configJson; }

    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getProviderCode() { return providerCode; }
    public void setProviderCode(String providerCode) { this.providerCode = providerCode; }
}
