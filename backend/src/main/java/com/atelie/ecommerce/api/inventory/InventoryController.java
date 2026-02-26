package com.atelie.ecommerce.api.inventory;

import com.atelie.ecommerce.application.dto.inventory.InventoryAdjustmentRequest;
import com.atelie.ecommerce.application.dto.inventory.InventoryBalanceResponse;
import com.atelie.ecommerce.application.service.inventory.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/{variantId}")
    public ResponseEntity<InventoryBalanceResponse> getBalance(@PathVariable UUID variantId) {
        // Correção: Chama o serviço usando o ID da Variante [cite: 281]
        Integer stock = inventoryService.getStock(variantId);
        return ResponseEntity.ok(new InventoryBalanceResponse(variantId, stock));
    }

    @PostMapping("/{variantId}")
    public ResponseEntity<Void> adjustStock(
            @PathVariable UUID variantId,
            @RequestBody @Valid InventoryAdjustmentRequest request) {
        
        inventoryService.addMovement(
                variantId, 
                request.type(), 
                request.quantity(), 
                request.reason(), 
                request.referenceId()
        );
        return ResponseEntity.ok().build();
    }
}
