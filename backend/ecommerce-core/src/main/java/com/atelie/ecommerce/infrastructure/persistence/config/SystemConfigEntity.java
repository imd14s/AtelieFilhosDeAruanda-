package com.atelie.ecommerce.infrastructure.persistence.config;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "system_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemConfigEntity {
    @Id
    private String configKey; 
    private String configValue;
}
