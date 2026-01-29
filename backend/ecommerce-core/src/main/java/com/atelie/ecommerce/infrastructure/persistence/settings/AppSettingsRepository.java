package com.atelie.ecommerce.infrastructure.persistence.settings;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppSettingsRepository extends JpaRepository<AppSettingsEntity, String> {
}
