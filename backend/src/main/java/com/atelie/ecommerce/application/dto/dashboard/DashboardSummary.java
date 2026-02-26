package com.atelie.ecommerce.application.dto.dashboard;

import java.math.BigDecimal;

public record DashboardSummary(
    BigDecimal totalSales,
    long pendingOrders,
    long lowStockAlerts
) {}
