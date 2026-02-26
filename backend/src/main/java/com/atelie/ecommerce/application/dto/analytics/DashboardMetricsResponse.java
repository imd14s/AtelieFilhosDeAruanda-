package com.atelie.ecommerce.application.dto.analytics;

import java.math.BigDecimal;
import java.util.List;

public record DashboardMetricsResponse(
        BigDecimal totalSales,
        long totalOrders,
        BigDecimal averageTicket,
        long activeProducts,
        List<SalesByDate> salesByDate,
        List<TopProduct> topProducts) {
    public record SalesByDate(String date, BigDecimal value) {
    }

    public record TopProduct(String name, int quantity) {
    }
}
