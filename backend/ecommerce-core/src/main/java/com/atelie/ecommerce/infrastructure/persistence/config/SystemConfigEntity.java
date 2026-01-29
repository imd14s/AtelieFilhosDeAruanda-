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
    private String configValue;

    (name = "config_json", columnDefinition = "jsonb")
    private String configJson;

    public String getConfigJson() { return configJson; }
    public void setConfigJson(String configJson) { this.configJson = configJson; }
}
