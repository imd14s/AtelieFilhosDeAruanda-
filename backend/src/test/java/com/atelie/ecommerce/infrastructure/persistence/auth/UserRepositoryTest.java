package com.atelie.ecommerce.infrastructure.persistence.auth;

import com.atelie.ecommerce.domain.auth.model.Role;
import com.atelie.ecommerce.infrastructure.persistence.auth.entity.UserEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private UserEntity user;

    @BeforeEach
    void setUp() {
        user = new UserEntity();
        user.setId(UUID.randomUUID());
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setPassword("password123");
        user.setRole(Role.CUSTOMER.name());
        user.setEmailVerified(true);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Test
    @DisplayName("Should find user by email")
    void findByEmail_ShouldReturnUser() {
        Optional<UserEntity> found = userRepository.findByEmail("test@example.com");
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Test User");
    }

    @Test
    @DisplayName("Should check if email exists")
    void existsByEmail_ShouldReturnTrue() {
        boolean exists = userRepository.existsByEmail("test@example.com");
        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Should find user by reset password token")
    void findByResetPasswordToken_ShouldReturnUser() {
        user.setResetPasswordToken("valid-token");
        userRepository.save(user);

        Optional<UserEntity> found = userRepository.findByResetPasswordToken("valid-token");
        assertThat(found).isPresent();
    }

    @Test
    @DisplayName("Should count users by role")
    void countByRole_ShouldReturnCount() {
        long count = userRepository.countByRole(Role.CUSTOMER.name());
        assertThat(count).isEqualTo(1);
    }

    @Test
    @DisplayName("Should count verified users by role")
    void countByRoleAndEmailVerifiedTrue_ShouldReturnCount() {
        long count = userRepository.countByRoleAndEmailVerifiedTrue(Role.CUSTOMER.name());
        assertThat(count).isEqualTo(1);
    }

    @Test
    @DisplayName("Should trigger @PrePersist on save")
    void prePersist_ShouldSetDefaultValues() {
        UserEntity newUser = new UserEntity();
        newUser.setName("New User");
        newUser.setEmail("new@example.com");
        newUser.setPassword("pass");
        // Not setting role or id
        
        UserEntity saved = userRepository.saveAndFlush(newUser);
        
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getRole()).isEqualTo("CUSTOMER");
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should trigger @PreUpdate on update")
    void preUpdate_ShouldUpdateTimestamp() throws InterruptedException {
        LocalDateTime initialUpdate = user.getUpdatedAt();
        Thread.sleep(10); // Ensure time difference
        
        user.setName("Updated Name");
        UserEntity updated = userRepository.saveAndFlush(user);
        
        assertThat(updated.getUpdatedAt()).isAfter(initialUpdate);
    }
}
