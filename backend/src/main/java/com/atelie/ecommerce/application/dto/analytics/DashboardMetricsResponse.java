package com.atelie.ecommerce.application.dto.analytics;

import java.math.BigDecimal;
import java.util.List;

public record DashboardMetricsResponse(
        BigDecimal totalSales,
        BigDecimal totalNetProfit,
        long totalOrders,
        BigDecimal averageTicket,
        BigDecimal cac,
        BigDecimal conversionRate,
        long activeProducts,
        CostBreakdown costBreakdown,
        List<SalesByDate> salesByDate,
        List<TopProduct> topProducts) {

    public record CostBreakdown(
            BigDecimal taxes,
            BigDecimal gatewayFees,
            BigDecimal logistics,
            BigDecimal productCost,
            BigDecimal netMargin) {
    }

    public record SalesByDate(String date, BigDecimal grossValue, BigDecimal netValue) {
    }

    public record TopProduct(String name, int quantity) {
    }
}
