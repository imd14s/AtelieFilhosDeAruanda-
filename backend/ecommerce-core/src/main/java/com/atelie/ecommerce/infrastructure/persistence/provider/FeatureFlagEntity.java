package com.atelie.ecommerce.infrastructure.persistence.provider;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "feature_flags",
       uniqueConstraints = @UniqueConstraint(name = "ux_feature_flags_key", columnNames = {"flag_key"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeatureFlagEntity {

    @Id
    private UUID id;

    @Column(name = "flag_key", nullable = false, length = 140)
    private String flagKey;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;

    @Lob
    @Column(name = "value_json")
    private String valueJson;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
