package com.atelie.ecommerce.api.analytics;

import com.atelie.ecommerce.application.dto.analytics.DashboardMetricsResponse;
import com.atelie.ecommerce.application.service.analytics.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardMetricsResponse> getDashboardMetrics(
            @RequestParam(required = false, defaultValue = "30d") String period) {
        return ResponseEntity.ok(analyticsService.getDashboardMetrics(period));
    }
}
