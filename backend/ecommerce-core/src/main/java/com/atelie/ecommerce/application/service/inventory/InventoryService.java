package com.atelie.ecommerce.application.service.inventory;

import com.atelie.ecommerce.domain.inventory.MovementType;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.inventory.InventoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.inventory.entity.InventoryMovementEntity;
import com.atelie.ecommerce.api.common.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;

    public InventoryService(InventoryRepository inventoryRepository, ProductRepository productRepository) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
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

        if (type == MovementType.OUT) {
            Integer currentStock = inventoryRepository.calculateCurrentStock(productId);
            if (currentStock < quantity) {
                throw new IllegalArgumentException("Insufficient stock. Current: " + currentStock + ", Required: " + quantity);
            }
        }

        InventoryMovementEntity movement = new InventoryMovementEntity(
                product, type, quantity, reason, refId
        );
        inventoryRepository.save(movement);
    }
}
