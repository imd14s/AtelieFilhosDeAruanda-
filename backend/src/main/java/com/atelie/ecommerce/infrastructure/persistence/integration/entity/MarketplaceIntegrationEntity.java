package com.atelie.ecommerce.infrastructure.persistence.integration.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "marketplace_integrations")
public class MarketplaceIntegrationEntity {
    public MarketplaceIntegrationEntity() {
    }

    public MarketplaceIntegrationEntity(String provider, boolean active) {
        this.provider = provider;
        this.active = active;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String provider; // Ex: 'mercadolivre', 'tiktok'

    @Column(name = "account_name")
    private String accountName; // Nome amigável no Dashboard (ex: 'Minha Loja SP')

    @Column(name = "external_seller_id")
    private String externalSellerId; // ID do lojista na plataforma externa (usado p/ webhooks)

    @Column(name = "encrypted_credentials")
    private String encryptedCredentials;

    @Column(name = "auth_payload")
    private String authPayload;

    @Column(name = "is_active")
    private boolean active;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (id == null)
            id = UUID.randomUUID();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Manual Getters/Setters for robustness (Lombok issues fallback)
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getEncryptedCredentials() {
        return encryptedCredentials;
    }

    public void setEncryptedCredentials(String encryptedCredentials) {
        this.encryptedCredentials = encryptedCredentials;
    }

    public String getAuthPayload() {
        return authPayload;
    }

    public void setAuthPayload(String authPayload) {
        this.authPayload = authPayload;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public String getExternalSellerId() {
        return externalSellerId;
    }

    public void setExternalSellerId(String externalSellerId) {
        this.externalSellerId = externalSellerId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
