package com.atelie.ecommerce.application.service.analytics;

import com.atelie.ecommerce.api.analytics.dto.DashboardMetricsResponse;
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

        public AnalyticsService(OrderRepository orderRepository, ProductRepository productRepository,
                        OrderItemRepository orderItemRepository) {
                this.orderRepository = orderRepository;
                this.productRepository = productRepository;
                this.orderItemRepository = orderItemRepository;
        }

        public DashboardMetricsResponse getDashboardMetrics(String period) {
                int days = parsePeriod(period);
                java.time.Instant startDate = java.time.Instant.now().minus(days, java.time.temporal.ChronoUnit.DAYS);

                // 1. Basic Counts
                long activeProducts = productRepository.countByActiveTrue();

                // 2. Orders in period
                List<OrderEntity> periodOrders = orderRepository.findByCreatedAtAfter(startDate);

                // Filter only valid orders (Paid/Shipped/Delivered) for sales calc
                List<OrderEntity> validOrders = periodOrders.stream()
                                .filter(o -> OrderStatus.PAID.name().equals(o.getStatus()) ||
                                                OrderStatus.SHIPPED.name().equals(o.getStatus()) ||
                                                OrderStatus.DELIVERED.name().equals(o.getStatus()))
                                .collect(Collectors.toList());

                BigDecimal totalSales = validOrders.stream()
                                .map(OrderEntity::getTotalAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                long totalOrdersCount = validOrders.size();

                BigDecimal averageTicket = totalOrdersCount > 0
                                ? totalSales.divide(BigDecimal.valueOf(totalOrdersCount), 2, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO;

                // 3. Sales By Date (In-Memory Aggregation for compatibility)
                Map<String, BigDecimal> salesByDateMap = validOrders.stream()
                                .collect(Collectors.groupingBy(
                                                o -> o.getCreatedAt().atZone(java.time.ZoneId.systemDefault())
                                                                .format(DateTimeFormatter.ofPattern("dd/MM")),
                                                Collectors.reducing(BigDecimal.ZERO, OrderEntity::getTotalAmount,
                                                                BigDecimal::add)));

                List<DashboardMetricsResponse.SalesByDate> salesByDate = salesByDateMap.entrySet().stream()
                                .map(e -> new DashboardMetricsResponse.SalesByDate(e.getKey(), e.getValue()))
                                .sorted(Comparator.comparing(DashboardMetricsResponse.SalesByDate::date))
                                .collect(Collectors.toList());

                // 4. Top Products
                List<DashboardMetricsResponse.TopProduct> topProducts = orderItemRepository
                                .findTopSellingProducts(startDate,
                                                PageRequest.of(0, 5))
                                .stream()
                                .map(p -> new DashboardMetricsResponse.TopProduct(p.getProductName(), p.getQuantity()))
                                .collect(Collectors.toList());

                return new DashboardMetricsResponse(
                                totalSales,
                                totalOrdersCount,
                                averageTicket,
                                activeProducts,
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
