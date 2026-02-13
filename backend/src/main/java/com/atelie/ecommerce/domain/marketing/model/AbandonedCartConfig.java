package com.atelie.ecommerce.domain.marketing.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "abandoned_cart_configs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AbandonedCartConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private Boolean enabled;

    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "triggers")
    private List<Map<String, Object>> triggers = new java.util.ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    private Map<String, Object> metadata;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (updatedAt == null)
            updatedAt = LocalDateTime.now();
        if (enabled == null)
            enabled = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Manual Getters/Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public List<Map<String, Object>> getTriggers() {
        return triggers;
    }

    public void setTriggers(List<Map<String, Object>> triggers) {
        this.triggers = triggers;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Manual Builder
    public static AbandonedCartConfigBuilder builder() {
        return new AbandonedCartConfigBuilder();
    }

    public static class AbandonedCartConfigBuilder {
        private AbandonedCartConfig instance = new AbandonedCartConfig();

        public AbandonedCartConfigBuilder id(UUID id) {
            instance.setId(id);
            return this;
        }

        public AbandonedCartConfigBuilder enabled(Boolean enabled) {
            instance.setEnabled(enabled);
            return this;
        }

        public AbandonedCartConfigBuilder triggers(List<Map<String, Object>> triggers) {
            instance.setTriggers(triggers);
            return this;
        }

        public AbandonedCartConfigBuilder metadata(Map<String, Object> metadata) {
            instance.setMetadata(metadata);
            return this;
        }

        public AbandonedCartConfigBuilder updatedAt(LocalDateTime updatedAt) {
            instance.setUpdatedAt(updatedAt);
            return this;
        }

        public AbandonedCartConfig build() {
            return instance;
        }
    }
}
