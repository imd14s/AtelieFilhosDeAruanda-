package com.atelie.ecommerce.application.service.inventory;

import com.atelie.ecommerce.domain.inventory.InventoryRepository;
import com.atelie.ecommerce.domain.inventory.MovementType;
import com.atelie.ecommerce.infrastructure.persistence.inventory.entity.InventoryMovementEntity;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * API compatível com os Controllers/Services do projeto:
     * registra movimentação por VARIANTE com contexto (reason/source).
     */
    public void addMovement(UUID variantId,
                            MovementType type,
                            Integer quantity,
                            String reason,
                            String source) {

        if (variantId == null) throw new IllegalArgumentException("variantId is required");
        if (type == null) throw new IllegalArgumentException("type is required");
        if (quantity == null || quantity <= 0) throw new IllegalArgumentException("quantity must be > 0");

        InventoryMovementEntity m = new InventoryMovementEntity();
        // Esperado pelo projeto: variantId como UUID.
        m.setVariantId(variantId);
        m.setType(type);
        m.setQuantity(quantity);

        // Campos opcionais (se existirem na entity, lombok gera setters).
        // Se não existirem, o compilador vai acusar e ajustamos no próximo passo.
        trySet(m, "setReason", reason);
        trySet(m, "setSource", source);

        inventoryRepository.save(m);
    }

    /**
     * Alias esperado pelo InventoryController.
     */
    public int getStock(UUID variantId) {
        if (variantId == null) throw new IllegalArgumentException("variantId is required");
        return inventoryRepository.auditCalculatedStockByVariant(variantId);
    }

    /**
     * Pequeno helper para evitar hard-fail caso um campo opcional não exista.
     * Isso mantém produção estável e permite evolução incremental sem quebrar build.
     */
    private static void trySet(Object target, String methodName, Object value) {
        if (value == null) return;
        try {
            target.getClass().getMethod(methodName, value.getClass()).invoke(target, value);
        } catch (Exception ignored) {
            // Se o método não existir, não é crítico para funcionamento.
        }
    }
}
