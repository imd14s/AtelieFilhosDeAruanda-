package com.atelie.ecommerce.api.fiscal;

import com.atelie.ecommerce.application.service.fiscal.FinancialAggregatorService;
import com.atelie.ecommerce.domain.fiscal.model.FinancialLedger;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/financial")
public class FinancialDashboardController {

    private final FinancialAggregatorService financialAggregatorService;

    public FinancialDashboardController(FinancialAggregatorService financialAggregatorService) {
        this.financialAggregatorService = financialAggregatorService;
    }

    /**
     * Retorna o Ledger consolidado de um pedido para o dashboard.
     */
    @GetMapping("/ledger/{orderId}")
    public ResponseEntity<FinancialLedger> getLedger(@PathVariable UUID orderId) {
        return ResponseEntity.ok(financialAggregatorService.getByOrder(orderId));
    }
}
