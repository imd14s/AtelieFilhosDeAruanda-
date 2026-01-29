package com.atelie.ecommerce.infrastructure.persistence.config;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="system_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemConfigEntity {
    @Id
    private String configKey;
    
    @Column(columnDefinition = "TEXT")
    private String configValue;

    @Column(name = "config_json", columnDefinition = "jsonb")
    private String configJson;
}
