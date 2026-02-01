package com.atelie.ecommerce.application.service.inventory;

import com.atelie.ecommerce.domain.inventory.MovementType;
import com.atelie.ecommerce.domain.inventory.event.InventoryChangedEvent;
import com.atelie.ecommerce.infrastructure.persistence.inventory.InventoryRepository;
import com.atelie.ecommerce.infrastructure.persistence.inventory.entity.InventoryMovementEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock private InventoryRepository inventoryRepository;
    @Mock private ProductVariantRepository variantRepository;
    @Mock private ApplicationEventPublisher eventPublisher;

    @InjectMocks private InventoryService inventoryService;

    @Test
    void shouldDecrementStock_WhenBalanceIsSufficient() {
        UUID variantId = UUID.randomUUID();
        ProductVariantEntity variant = new ProductVariantEntity();
        variant.setId(variantId);
        variant.setSku("SKU-TEST");
        variant.setStockQuantity(10);
        variant.setProduct(new ProductEntity()); // Necessário para o evento

        when(variantRepository.findById(variantId)).thenReturn(Optional.of(variant));
        // Simula update bem sucedido (1 linha afetada)
        when(variantRepository.decrementStock(variantId, 5)).thenReturn(1);

        inventoryService.addMovement(variantId, MovementType.OUT, 5, "Venda", "REF-1");

        // Deve salvar histórico
        verify(inventoryRepository).save(any(InventoryMovementEntity.class));
        // Deve publicar evento
        verify(eventPublisher).publishEvent(any(InventoryChangedEvent.class));
    }

    @Test
    void shouldThrow_WhenStockInsufficient() {
        UUID variantId = UUID.randomUUID();
        ProductVariantEntity variant = new ProductVariantEntity();
        variant.setId(variantId);
        variant.setSku("SKU-TEST");

        when(variantRepository.findById(variantId)).thenReturn(Optional.of(variant));
        // Simula falha no update (0 linhas afetadas por causa do WHERE quantity >= X)
        when(variantRepository.decrementStock(variantId, 100)).thenReturn(0);

        assertThrows(IllegalArgumentException.class, () -> 
            inventoryService.addMovement(variantId, MovementType.OUT, 100, "Venda", "REF-1")
        );
        
        // Não deve salvar movimento se falhou
        verify(inventoryRepository, never()).save(any());
    }
}
