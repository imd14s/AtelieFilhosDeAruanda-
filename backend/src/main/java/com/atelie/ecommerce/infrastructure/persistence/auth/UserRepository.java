package com.atelie.ecommerce.infrastructure.persistence.auth;

import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, UUID> {
    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<UserEntity> findByResetPasswordToken(String token);

    long countByRole(String role);

    long countByRoleAndEmailVerifiedTrue(String role, boolean verified);
}
