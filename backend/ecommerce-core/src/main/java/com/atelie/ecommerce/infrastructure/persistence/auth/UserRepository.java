package com.atelie.ecommerce.infrastructure.persistence.auth;

import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserEntity, UUID> {
  Optional<UserEntity> findByEmail(String email);
}
