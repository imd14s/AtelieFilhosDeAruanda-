package com.atelie.ecommerce.infrastructure.persistence.media;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MediaAssetRepository extends JpaRepository<MediaAssetEntity, Long> {
    Optional<MediaAssetEntity> findByStorageKey(String storageKey);
}
