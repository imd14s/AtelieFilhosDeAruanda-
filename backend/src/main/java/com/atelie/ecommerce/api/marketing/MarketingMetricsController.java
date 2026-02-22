package com.atelie.ecommerce.api.marketing;

import com.atelie.ecommerce.application.service.marketing.MarketingMetricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/marketing/metrics")
@RequiredArgsConstructor
public class MarketingMetricsController {

    private final MarketingMetricsService metricsService;

    @GetMapping
    public ResponseEntity<Map<String, Long>> getMetrics() {
        return ResponseEntity.ok(metricsService.getMetrics());
    }
}
