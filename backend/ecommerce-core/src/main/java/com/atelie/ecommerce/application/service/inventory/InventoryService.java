package com.atelie.ecommerce.application.service.inventory;

import com.atelie.ecommerce.domain.inventory.MovementType;
import com.atelie.ecommerce.domain.inventory.event.InventoryChangedEvent;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity;
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
    private final ProductVariantRepository variantRepository; // Agora usa VariantRepo
    private final ApplicationEventPublisher eventPublisher;

    public InventoryService(InventoryRepository inventoryRepository, 
                            ProductVariantRepository variantRepository,
                            ApplicationEventPublisher eventPublisher) {
        this.inventoryRepository = inventoryRepository;
        this.variantRepository = variantRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public Integer getStock(UUID variantId) {
        return variantRepository.findById(variantId)
                .map(ProductVariantEntity::getStockQuantity)
                .orElseThrow(() -> new NotFoundException("Variant not found"));
    }

    @Transactional
    public void addMovement(UUID variantId, MovementType type, Integer quantity, String reason, String refId) {
        ProductVariantEntity variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new NotFoundException("Variant not found"));

        if (type == MovementType.OUT) {
            int rowsUpdated = variantRepository.decrementStock(variantId, quantity);
            if (rowsUpdated == 0) {
                throw new IllegalArgumentException("Estoque insuficiente para a variante: " + variant.getSku());
            }
        } else if (type == MovementType.IN) {
            variantRepository.incrementStock(variantId, quantity);
        }

        // Registra histórico (InventoryMovementEntity precisará ser atualizado para ter variant)
        // Por compatibilidade com o código antigo, estamos setando o produto pai
        InventoryMovementEntity movement = new InventoryMovementEntity();
        movement.setId(UUID.randomUUID());
        movement.setProduct(variant.getProduct());
        movement.setVariantId(variant.getId()); // Campo novo
        movement.setType(type);
        movement.setQuantity(quantity);
        movement.setReason(reason);
        movement.setReferenceId(refId);
        
        inventoryRepository.save(movement);

        Integer newBalance = variantRepository.findById(variantId).get().getStockQuantity();
        // Publica evento usando o ID do produto pai para listeners de vitrine, mas o saldo é da variante
        eventPublisher.publishEvent(new InventoryChangedEvent(variant.getProduct().getId(), newBalance));
    }
}
