package com.atelie.ecommerce.application.service.inventory;

import com.atelie.ecommerce.domain.inventory.InventoryRepository;
import com.atelie.ecommerce.domain.inventory.StockMovementEntity;
import com.atelie.ecommerce.domain.inventory.StockMovementType;
import org.springframework.stereotype.Service;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * Registra um movimento de estoque por VARIANTE.
     */
    public void addMovement(Long variantId, int quantity, StockMovementType type) {
        StockMovementEntity movement = new StockMovementEntity();
        movement.setVariantId(variantId);
        movement.setQuantity(quantity);
        movement.setType(type);

        inventoryRepository.save(movement);
    }

    /**
     * Retorna o estoque auditado da VARIANTE.
     */
    public int getCurrentStock(Long variantId) {
        return inventoryRepository.auditCalculatedStockByVariant(variantId);
    }
}
