package com.atelie.ecommerce.api.checkout;

import com.atelie.ecommerce.api.order.dto.CreateOrderItemRequest;
import com.atelie.ecommerce.api.order.dto.CreateOrderRequest;
import com.atelie.ecommerce.api.payment.dto.PaymentResponse;
import com.atelie.ecommerce.application.service.order.OrderService;
import com.atelie.ecommerce.application.service.payment.PaymentService;
import com.atelie.ecommerce.infrastructure.persistence.order.OrderEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

        private final OrderService orderService;
        private final PaymentService paymentService;

        public CheckoutController(OrderService orderService, PaymentService paymentService) {
                this.orderService = orderService;
                this.paymentService = paymentService;
        }

        @PostMapping("/process")
        public ResponseEntity<?> processOrder(@RequestBody Map<String, Object> payload) {
                // 1. Extrair dados básicos
                String customerName = (String) payload.get("customerName");
                String customerEmail = (String) payload.get("customerEmail");
                String paymentMethodId = (String) payload.getOrDefault("paymentMethod", "pix");
                String paymentToken = (String) payload.get("paymentToken");
                String cardId = (String) payload.get("cardId");

                // 2. Extrair itens
                List<Map<String, Object>> itemsRaw = (List<Map<String, Object>>) payload.get("items");
                List<CreateOrderItemRequest> items = itemsRaw.stream().map(item -> new CreateOrderItemRequest(
                                java.util.UUID.fromString((String) item.get("productId")),
                                item.get("variantId") != null
                                                ? java.util.UUID.fromString((String) item.get("variantId"))
                                                : null,
                                (Integer) item.get("quantity"))).collect(Collectors.toList());

                // 3. Extrair dados de frete estruturados ou do campo genérico
                Map<String, Object> shippingRaw = (Map<String, Object>) payload.get("shipping");
                String street = null, number = null, complement = null, neighborhood = null, city = null, state = null,
                                zip = null, provider = null;
                java.math.BigDecimal cost = java.math.BigDecimal.ZERO;

                if (shippingRaw != null) {
                        street = (String) shippingRaw.get("street");
                        number = (String) shippingRaw.get("number");
                        complement = (String) shippingRaw.get("complement");
                        neighborhood = (String) shippingRaw.get("neighborhood");
                        city = (String) shippingRaw.get("city");
                        state = (String) shippingRaw.get("state");
                        zip = (String) shippingRaw.get("zipCode");
                        provider = (String) shippingRaw.get("service");
                        Object costObj = shippingRaw.get("price");
                        if (costObj instanceof Number)
                                cost = new java.math.BigDecimal(costObj.toString());
                }

                String customerDocument = payload.containsKey("customerDocument")
                                ? (String) payload.get("customerDocument")
                                : "00000000000";

                // 4. Criar o pedido (Status PENDING)
                CreateOrderRequest orderRequest = new CreateOrderRequest(
                                "STOREFRONT",
                                null,
                                customerName,
                                customerEmail,
                                items,
                                customerDocument,
                                street, number, complement, neighborhood, city, state, zip, cost, provider);

                OrderEntity order = orderService.createOrder(orderRequest);

                // 5. Gerar o pagamento
                PaymentResponse payment = paymentService.processPayment(
                                order.getId(),
                                customerName,
                                customerEmail,
                                order.getTotalAmount(),
                                paymentMethodId,
                                paymentToken,
                                cardId);

                // 6. Retornar dados combinados
                return ResponseEntity.ok(Map.of(
                                "orderId", order.getId().toString(),
                                "status", order.getStatus(),
                                "payment", payment));
        }
}
