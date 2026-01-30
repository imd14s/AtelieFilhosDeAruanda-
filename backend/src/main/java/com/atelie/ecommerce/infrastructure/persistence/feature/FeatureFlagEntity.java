package com.atelie.ecommerce.infrastructure.persistence.feature;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "feature_flags")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeatureFlagEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "flag_key", nullable = false, unique = true)
    private String flagKey;

    @Column(nullable = false)
    private boolean enabled;

    @Column(name = "value_json", columnDefinition = "text")
    private String valueJson;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void prePersist() {
        this.updatedAt = LocalDateTime.now();
    }
}
