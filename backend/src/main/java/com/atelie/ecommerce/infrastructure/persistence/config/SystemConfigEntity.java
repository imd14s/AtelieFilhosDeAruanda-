package com.atelie.ecommerce.infrastructure.persistence.config;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "system_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemConfigEntity {
    @Id
    @Column(name = "config_key")
    @com.fasterxml.jackson.annotation.JsonProperty("configKey")
    private String configKey;

    @Column(name = "config_value")
    private String configValue;

    @Column(name = "config_json")
    private String configJson;

    public String getConfigKey() {
        return configKey;
    }

    public void setConfigKey(String configKey) {
        this.configKey = configKey;
    }

    public String getConfigValue() {
        return configValue;
    }

    public void setConfigValue(String configValue) {
        this.configValue = configValue;
    }

    public String getConfigJson() {
        return configJson;
    }

    public void setConfigJson(String configJson) {
        this.configJson = configJson;
    }
}
