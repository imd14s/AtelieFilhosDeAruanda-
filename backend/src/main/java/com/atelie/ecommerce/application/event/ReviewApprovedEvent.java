package com.atelie.ecommerce.application.event;

import org.springframework.context.ApplicationEvent;

import java.util.UUID;

public class ReviewApprovedEvent extends ApplicationEvent {

    private final UUID reviewId;
    private final UUID userId;
    private final boolean hasMedia;

    public ReviewApprovedEvent(Object source, UUID reviewId, UUID userId, boolean hasMedia) {
        super(source);
        this.reviewId = reviewId;
        this.userId = userId;
        this.hasMedia = hasMedia;
    }

    public UUID getReviewId() {
        return reviewId;
    }

    public UUID getUserId() {
        return userId;
    }

    public boolean isHasMedia() {
        return hasMedia;
    }
}
