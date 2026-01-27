package com.atelie.ecommerce.infrastructure.persistence.provider;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "service_provider_configs",
       uniqueConstraints = @UniqueConstraint(name = "ux_provider_configs_provider_env", columnNames = {"provider_id", "environment"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceProviderConfigEntity {

    @Id
    private UUID id;

    @Column(name = "provider_id", nullable = false)
    private UUID providerId;

    @Column(name = "environment", nullable = false, length = 20)
    private String environment;

    @Lob
    @Column(name = "config_json", nullable = false)
    private String configJson;

    @Column(name = "secrets_ref", length = 200)
    private String secretsRef;

    @Column(name = "version", nullable = false)
    private int version;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
