package com.atelie.ecommerce.domain.marketing.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "email_signatures")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailSignature {

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public String getRole() {
        return role;
    }

    public String getStoreName() {
        return storeName;
    }

    public String getWhatsapp() {
        return whatsapp;
    }

    public String getEmail() {
        return email;
    }

    public String getStoreUrl() {
        return storeUrl;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public String getMotto() {
        return motto;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name; // Nome interno para identificação

    @Column(name = "owner_name")
    private String ownerName;

    private String role;

    @Column(name = "store_name")
    private String storeName;

    private String whatsapp;

    private String email;

    @Column(name = "store_url")
    private String storeUrl;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    private String motto;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
