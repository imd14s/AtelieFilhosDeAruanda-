package com.atelie.ecommerce.api.fiscal;

import com.atelie.ecommerce.application.service.fiscal.TaxProvisionService;
import com.atelie.ecommerce.domain.fiscal.model.TaxProvision;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/profitability")
public class ProfitabilityController {

    private final TaxProvisionService provisionService;

    public ProfitabilityController(TaxProvisionService provisionService) {
        this.provisionService = provisionService;
    }

    @GetMapping("/provisions")
    public List<TaxProvision> getProvisions() {
        return provisionService.getAll();
    }

    @PostMapping("/provisions/consolidate")
    public TaxProvision consolidate(@RequestParam int month, @RequestParam int year) {
        return provisionService.consolidateMonth(month, year);
    }
}
