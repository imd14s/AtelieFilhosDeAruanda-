package com.atelie.ecommerce.infrastructure.persistence.review;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "review_media")
@Data
public class ReviewMediaEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id")
    private ReviewEntity review;

    private String url;

    private String type; // IMAGE, VIDEO

    @PrePersist
    protected void onCreate() {
        if (id == null)
            id = UUID.randomUUID();
    }
}
