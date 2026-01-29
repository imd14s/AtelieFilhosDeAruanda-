package com.atelie.ecommerce.application.service.inventory;

import com.atelie.ecommerce.domain.inventory.MovementType;
import com.atelie.ecommerce.domain.inventory.event.InventoryChangedEvent;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductEntity;
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
        return productRepository.findById(productId)
                .map(ProductEntity::getStockQuantity)
                .orElseThrow(() -> new NotFoundException("Product not found"));
    }

    @Transactional
    public void addMovement(UUID productId, MovementType type, Integer quantity, String reason, String refId) {
        // Validação básica de existência
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        // Lógica Blindada contra Race Condition
        if (type == MovementType.OUT) {
            int rowsUpdated = productRepository.decrementStock(productId, quantity);
            if (rowsUpdated == 0) {
                throw new IllegalArgumentException("Estoque insuficiente para realizar a saída.");
            }
        } else if (type == MovementType.IN) {
            productRepository.incrementStock(productId, quantity);
        }

        // Registra histórico
        InventoryMovementEntity movement = new InventoryMovementEntity(
                product, type, quantity, reason, refId
        );
        inventoryRepository.save(movement);

        // Busca saldo atualizado para o evento (leitura pós-update)
        // Nota: Em alta performance, poderíamos calcular no Java, mas a busca garante consistência.
        Integer newBalance = productRepository.findById(productId).get().getStockQuantity();
        
        eventPublisher.publishEvent(new InventoryChangedEvent(productId, newBalance));
    }
}
