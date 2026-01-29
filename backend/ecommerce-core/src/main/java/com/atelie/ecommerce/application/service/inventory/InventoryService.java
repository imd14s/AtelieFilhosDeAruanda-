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
        // Leitura rápida direto da tabela de produtos (snapshot atual)
        return productRepository.findById(productId)
                .map(ProductEntity::getStockQuantity)
                .orElseThrow(() -> new NotFoundException("Product not found"));
    }

    @Transactional
    public void addMovement(UUID productId, MovementType type, Integer quantity, String reason, String refId) {
        // 1. LOCK: Garante que ninguém mais mexa nesse produto nesta transação
        ProductEntity product = productRepository.findByIdWithLock(productId)
                .orElseThrow(() -> new NotFoundException("Product not found"));

        Integer currentStock = product.getStockQuantity();
        if (currentStock == null) currentStock = 0;

        // 2. Validação de Regra de Negócio
        if (type == MovementType.OUT) {
            if (currentStock < quantity) {
                throw new IllegalArgumentException("Insufficient stock. Current: " + currentStock + ", Required: " + quantity);
            }
        }

        // 3. Log de Auditoria (Histórico)
        InventoryMovementEntity movement = new InventoryMovementEntity(
                product, type, quantity, reason, refId
        );
        inventoryRepository.save(movement);
        
        // 4. Atualização do Saldo (Snapshot Rápido)
        int newBalance = (type == MovementType.IN) ? currentStock + quantity : currentStock - quantity;
        product.setStockQuantity(newBalance);
        productRepository.save(product);

        // 5. Dispara evento para integrações/notificações
        eventPublisher.publishEvent(new InventoryChangedEvent(productId, newBalance));
    }
}
