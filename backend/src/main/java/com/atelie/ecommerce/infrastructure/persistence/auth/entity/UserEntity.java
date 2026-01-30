package com.atelie.ecommerce.infrastructure.persistence.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String role; // USER, ADMIN

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "active")
    private Boolean active;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // --- CONSTRUTOR DE COMPATIBILIDADE (Resgate) ---
    // Necessário para AuthService e AdminBootstrap funcionarem sem refatoração profunda
    public UserEntity(String name, String email, String password, String role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
        if (role == null) role = "USER";
        if (active == null) active = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
