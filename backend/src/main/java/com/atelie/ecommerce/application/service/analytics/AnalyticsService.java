package com.atelie.ecommerce.application.service.analytics;

import com.atelie.ecommerce.application.dto.analytics.DashboardMetricsResponse;
import com.atelie.ecommerce.domain.order.OrderStatus;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderItemRepository;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderRepository;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import com.atelie.ecommerce.infrastructure.persistence.product.ProductRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

        private final OrderRepository orderRepository;
        private final ProductRepository productRepository;
        private final OrderItemRepository orderItemRepository;
        private final com.atelie.ecommerce.domain.fiscal.repository.FinancialLedgerRepository ledgerRepository;

        public AnalyticsService(OrderRepository orderRepository, ProductRepository productRepository,
                        OrderItemRepository orderItemRepository,
                        com.atelie.ecommerce.domain.fiscal.repository.FinancialLedgerRepository ledgerRepository) {
                this.orderRepository = orderRepository;
                this.productRepository = productRepository;
                this.orderItemRepository = orderItemRepository;
                this.ledgerRepository = ledgerRepository;
        }

        public DashboardMetricsResponse getDashboardMetrics(String period) {
                int days = parsePeriod(period);
                java.time.Instant startDate = java.time.Instant.now().minus(days, java.time.temporal.ChronoUnit.DAYS);
                java.time.Instant endDate = java.time.Instant.now();

                // 1. Basic Counts
                long activeProducts = productRepository.countByActiveTrue();

                // 2. Orders & Financials (Real Logic from Ledger)
                List<com.atelie.ecommerce.domain.fiscal.model.FinancialLedger> ledgers = ledgerRepository
                                .findAllInPeriod(startDate, endDate);

                BigDecimal totalSales = ledgers.stream()
                                .map(com.atelie.ecommerce.domain.fiscal.model.FinancialLedger::getGrossAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal totalNetProfit = ledgers.stream()
                                .map(com.atelie.ecommerce.domain.fiscal.model.FinancialLedger::getNetAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                long totalOrdersCount = ledgers.size();

                BigDecimal averageTicket = totalOrdersCount > 0
                                ? totalSales.divide(BigDecimal.valueOf(totalOrdersCount), 2, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO;

                // 3. Cost Breakdown
                BigDecimal totalTaxes = ledgers.stream()
                                .map(com.atelie.ecommerce.domain.fiscal.model.FinancialLedger::getTaxesAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal totalFees = ledgers.stream()
                                .map(com.atelie.ecommerce.domain.fiscal.model.FinancialLedger::getGatewayFee)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal totalLogistics = ledgers.stream()
                                .map(com.atelie.ecommerce.domain.fiscal.model.FinancialLedger::getShippingCost)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal totalProductCost = ledgers.stream()
                                .map(com.atelie.ecommerce.domain.fiscal.model.FinancialLedger::getProductCost)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                DashboardMetricsResponse.CostBreakdown costBreakdown = new DashboardMetricsResponse.CostBreakdown(
                                totalTaxes, totalFees, totalLogistics, totalProductCost, totalNetProfit);

                // 4. Sales By Date (Aggregated by day)
                Map<String, List<com.atelie.ecommerce.domain.fiscal.model.FinancialLedger>> groupedByDate = ledgers
                                .stream()
                                .collect(Collectors.groupingBy(
                                                l -> l.getCreatedAt().atZone(java.time.ZoneId.systemDefault())
                                                                .format(DateTimeFormatter.ofPattern("dd/MM"))));

                List<DashboardMetricsResponse.SalesByDate> salesByDate = groupedByDate.entrySet().stream()
                                .map(e -> {
                                        BigDecimal gross = e.getValue().stream().map(
                                                        com.atelie.ecommerce.domain.fiscal.model.FinancialLedger::getGrossAmount)
                                                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                                        BigDecimal net = e.getValue().stream().map(
                                                        com.atelie.ecommerce.domain.fiscal.model.FinancialLedger::getNetAmount)
                                                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                                        return new DashboardMetricsResponse.SalesByDate(e.getKey(), gross, net);
                                })
                                .sorted(Comparator.comparing(DashboardMetricsResponse.SalesByDate::date))
                                .collect(Collectors.toList());

                // 5. KPIs (CAC & Conversion - Simulated until real tracking is added)
                // CAC: Simulado como 10% do faturamento por enquanto
                BigDecimal cac = totalSales.multiply(new BigDecimal("0.10")).divide(
                                totalOrdersCount > 0 ? BigDecimal.valueOf(totalOrdersCount) : BigDecimal.ONE, 2,
                                RoundingMode.HALF_UP);

                // Conversão: Simulado entre 1.5% e 3.2% baseado em pedidos reais
                BigDecimal conversionRate = totalOrdersCount > 0 ? new BigDecimal("2.54") : BigDecimal.ZERO;

                // 6. Top Products
                List<DashboardMetricsResponse.TopProduct> topProducts = orderItemRepository
                                .findTopSellingProducts(startDate, PageRequest.of(0, 5))
                                .stream()
                                .map(p -> new DashboardMetricsResponse.TopProduct(p.getProductName(), p.getQuantity()))
                                .collect(Collectors.toList());

                return new DashboardMetricsResponse(
                                totalSales,
                                totalNetProfit,
                                totalOrdersCount,
                                averageTicket,
                                cac,
                                conversionRate,
                                activeProducts,
                                costBreakdown,
                                salesByDate,
                                topProducts);
        }

        private int parsePeriod(String period) {
                if ("7d".equals(period))
                        return 7;
                if ("90d".equals(period))
                        return 90;
                return 30; // default 30d
        }
}
