package com.atelie.ecommerce.application.service.inventory;

import com.atelie.ecommerce.application.service.inventory.InventoryService;
import com.atelie.ecommerce.domain.inventory.MovementType;
import com.atelie.ecommerce.domain.inventory.event.InventoryChangedEvent;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.inventory.InventoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.inventory.entity.InventoryMovementEntity;
import com.atelie.ecommerce.api.common.exception.NotFoundException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final ApplicationEventPublisher eventPublisher;

    public InventoryService(InventoryRepository inventoryRepository, 
                            ProductRepository productRepository,
                            ApplicationEventPublisher eventPublisher) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public Integer getStock(UUID productId) {
        if (!productRepository.existsById(productId)) {
            throw new NotFoundException("Product not found");
        }
        return inventoryRepository.calculateCurrentStock(productId);
    }

    @Transactional
    public void addMovement(UUID productId, MovementType type, Integer quantity, String reason, String refId) {
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        Integer currentStock = inventoryRepository.calculateCurrentStock(productId);

        if (type == MovementType.OUT) {
            if (currentStock < quantity) {
                throw new IllegalArgumentException("Insufficient stock. Current: " + currentStock + ", Required: " + quantity);
            }
        }

        InventoryMovementEntity movement = new InventoryMovementEntity(
                product, type, quantity, reason, refId
        );
        inventoryRepository.save(movement);
        
        // Calcula novo saldo e dispara evento
        int newBalance = (type == MovementType.IN) ? currentStock + quantity : currentStock - quantity;
        eventPublisher.publishEvent(new InventoryChangedEvent(productId, newBalance));
    }
}
