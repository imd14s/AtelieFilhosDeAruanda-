package com.atelie.ecommerce.domain.common.event;

import org.springframework.context.ApplicationEvent;

public class EntityChangedEvent extends ApplicationEvent {
    private final String entityType;

    public EntityChangedEvent(Object source, String entityType) {
        super(source);
        this.entityType = entityType;
    }

    public String getEntityType() {
        return entityType;
    }
}
