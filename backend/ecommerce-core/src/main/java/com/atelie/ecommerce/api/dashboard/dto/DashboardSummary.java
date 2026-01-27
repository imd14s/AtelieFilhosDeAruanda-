package com.atelie.ecommerce.api.dashboard.dto;

import java.math.BigDecimal;

public record DashboardSummary(
    BigDecimal totalSales,
    long pendingOrders,
    long lowStockAlerts
) {}
