package com.atelie.ecommerce.api.inventory;

import com.atelie.ecommerce.api.inventory.dto.InventoryAdjustmentRequest;
import com.atelie.ecommerce.api.inventory.dto.InventoryBalanceResponse;
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

    @GetMapping("/{productId}")
    public ResponseEntity<InventoryBalanceResponse> getBalance(@PathVariable UUID productId) {
        Integer stock = inventoryService.getStock(productId);
        return ResponseEntity.ok(new InventoryBalanceResponse(productId, stock));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Void> adjustStock(
            @PathVariable UUID productId,
            @RequestBody @Valid InventoryAdjustmentRequest request) {
        
        inventoryService.addMovement(
                productId, 
                request.type(), 
                request.quantity(), 
                request.reason(), 
                request.referenceId()
        );
        return ResponseEntity.ok().build();
    }
}
