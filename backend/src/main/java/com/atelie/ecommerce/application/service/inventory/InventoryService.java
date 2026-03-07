package com.atelie.ecommerce.application.service.inventory;

import com.atelie.ecommerce.domain.inventory.InventoryRepository;
import com.atelie.ecommerce.domain.inventory.MovementType;
import com.atelie.ecommerce.infrastructure.persistence.inventory.entity.InventoryMovementEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductVariantRepository;
import com.atelie.ecommerce.infrastructure.persistence.product.entity.ProductEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;

    public InventoryService(InventoryRepository inventoryRepository,
            ProductVariantRepository variantRepository,
            ProductRepository productRepository) {
        this.inventoryRepository = inventoryRepository;
        this.variantRepository = variantRepository;
        this.productRepository = productRepository;
    }

    /**
     * API compatível com os Controllers/Services do projeto:
     * registra movimentação por VARIANTE com contexto (reason/source).
     * 
     * CORREÇÃO: Sincroniza stockQuantity denormalizado nas entidades fisicas.
     */
    @Transactional
    public void addMovement(UUID variantId,
            MovementType type,
            Integer quantity,
            String reason,
            String source) {

        if (variantId == null)
            throw new IllegalArgumentException("variantId is required");
        if (type == null)
            throw new IllegalArgumentException("type is required");
        if (quantity == null || quantity < 0)
            throw new IllegalArgumentException("quantity must be >= 0");

        var variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new IllegalArgumentException("Variant not found: " + variantId));

        InventoryMovementEntity m = new InventoryMovementEntity();
        m.setVariantId(variantId);
        m.setProduct(variant.getProduct());
        m.setType(type);
        m.setQuantity(quantity);

        trySet(m, "setReason", reason);
        trySet(m, "setSource", source);

        inventoryRepository.save(m);

        // --- SINCRONIZAÇÃO REATIVA DO ESTOQUE ---
        
        // 1. Aplica o delta no estoque ATUAL da variante (não recalcula do zero)
        // Isso preserva o estoque inicial que foi definido diretamente na entidade,
        // mesmo que não exista um registro IN correspondente na tabela inventory_movements.
        int currentStock = variant.getStockQuantity() != null ? variant.getStockQuantity() : 0;
        int delta = (type == MovementType.IN) ? quantity : -quantity;
        int newVariantStock = currentStock + delta;
        variant.setStockQuantity(newVariantStock);
        variantRepository.save(variant);

        // 2. Recalcula e atualiza estoque no PRODUTO PAI (soma de todas as variantes)
        ProductEntity product = variant.getProduct();
        int totalProductStock = variantRepository.findByProductId(product.getId()).stream()
                .filter(v -> v.getActive() != null && v.getActive())
                .mapToInt(v -> v.getStockQuantity() != null ? v.getStockQuantity() : 0)
                .sum();
        
        product.setStockQuantity(totalProductStock);
        productRepository.save(product);
    }

    /**
     * Alias esperado pelo InventoryController.
     */
    public int getStock(UUID variantId) {
        if (variantId == null)
            throw new IllegalArgumentException("variantId is required");
        return inventoryRepository.auditCalculatedStockByVariant(variantId);
    }

    private static void trySet(Object target, String methodName, Object value) {
        if (value == null)
            return;
        try {
            target.getClass().getMethod(methodName, value.getClass()).invoke(target, value);
        } catch (Exception ignored) {
        }
    }
}

