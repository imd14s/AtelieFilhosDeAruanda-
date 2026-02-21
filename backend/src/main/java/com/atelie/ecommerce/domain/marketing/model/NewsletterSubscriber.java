package com.atelie.ecommerce.domain.marketing.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "newsletter_subscribers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsletterSubscriber {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified;

    @Column(name = "verification_token")
    private String verificationToken;

    @Column(name = "active", nullable = false)
    private Boolean active;

    @Column(name = "subscribed_at", nullable = false)
    private LocalDateTime subscribedAt;

    @PrePersist
    protected void onCreate() {
        if (subscribedAt == null)
            subscribedAt = LocalDateTime.now();
        if (emailVerified == null)
            emailVerified = false;
        if (active == null)
            active = true;
    }
}
