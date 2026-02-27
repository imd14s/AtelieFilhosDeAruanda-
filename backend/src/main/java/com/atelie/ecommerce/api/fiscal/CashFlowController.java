package com.atelie.ecommerce.api.fiscal;

import com.atelie.ecommerce.application.service.fiscal.BankingReconciliationService;
import com.atelie.ecommerce.application.service.fiscal.CashFlowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/finance")
@RequiredArgsConstructor
public class CashFlowController {

    private final CashFlowService cashFlowService;
    private final BankingReconciliationService reconciliationService;

    @GetMapping("/cash-flow/summary")
    public ResponseEntity<Map<String, BigDecimal>> getSummary() {
        return ResponseEntity.ok(cashFlowService.getBalanceSummary());
    }

    @GetMapping("/cash-flow/projection")
    public ResponseEntity<List<Map<String, Object>>> getProjection(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(cashFlowService.getProjection(days));
    }

    @PostMapping("/reconciliation/sync")
    public ResponseEntity<Void> triggerSync() {
        reconciliationService.syncGateways();
        return ResponseEntity.ok().build();
    }
}
