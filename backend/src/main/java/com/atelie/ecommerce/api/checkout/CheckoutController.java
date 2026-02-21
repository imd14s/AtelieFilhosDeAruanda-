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
        // 1. Extrair dados do cliente e itens
        String customerName = (String) payload.get("customerName");
        String customerEmail = (String) payload.get("customerEmail");
        // CPF/CNPJ opcional para o OrderEntity mas necessário para alguns drivers de
        // pagamento

        List<Map<String, Object>> itemsRaw = (List<Map<String, Object>>) payload.get("items");
        List<CreateOrderItemRequest> items = itemsRaw.stream().map(item -> new CreateOrderItemRequest(
                java.util.UUID.fromString((String) item.get("productId")),
                item.get("variantId") != null ? java.util.UUID.fromString((String) item.get("variantId")) : null,
                (Integer) item.get("quantity"))).collect(Collectors.toList());

        // 2. Criar o pedido (Status PENDING)
        CreateOrderRequest orderRequest = new CreateOrderRequest(
                "STOREFRONT",
                null, // externalId gerado pelo sistema
                customerName,
                items);

        OrderEntity order = orderService.createOrder(orderRequest);

        // 3. Gerar o pagamento (PIX)
        PaymentResponse payment = paymentService.createPixPayment(
                order.getId(),
                customerName,
                customerEmail,
                order.getTotalAmount());

        // 4. Retornar dados combinados
        return ResponseEntity.ok(Map.of(
                "orderId", order.getId().toString(),
                "status", order.getStatus(),
                "payment", payment));
    }
}
