package com.atelie.ecommerce.infrastructure.persistence.fiscal.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "fiscal_integrations")
@Getter
@Setter
public class FiscalIntegrationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "provider_name", nullable = false, unique = true)
    private String providerName;

    @Column(name = "api_key", nullable = false)
    private String apiKey;

    @Column(name = "api_url")
    private String apiUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "settings_json")
    private Map<String, Object> settings;

    private boolean active;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
