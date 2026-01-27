package com.atelie.ecommerce.application.service.inventory;

import com.atelie.ecommerce.domain.inventory.MovementType;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.catalog.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.inventory.InventoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.inventory.entity.InventoryMovementEntity;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private InventoryService inventoryService;

    @Test
    void shouldAddInMovement() {
        UUID productId = UUID.randomUUID();
        ProductEntity product = new ProductEntity();
        
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        
        inventoryService.addMovement(productId, MovementType.IN, 10, "Purchase", "REF01");
        
        verify(inventoryRepository).save(any(InventoryMovementEntity.class));
    }

    @Test
    void shouldBlockOutMovementIfInsufficientStock() {
        UUID productId = UUID.randomUUID();
        ProductEntity product = new ProductEntity();
        
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(inventoryRepository.calculateCurrentStock(productId)).thenReturn(5);
        
        assertThrows(IllegalArgumentException.class, () -> 
            inventoryService.addMovement(productId, MovementType.OUT, 10, "Sale", "REF02")
        );
        
        verify(inventoryRepository, never()).save(any());
    }
}
