package com.atelie.ecommerce.application.service.payment;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/pix")
    public ResponseEntity<?> createPayment(@RequestBody Map<String, Object> request) {
        UUID orderId = UUID.fromString(request.get("orderId").toString());
        String email = (String) request.get("email");
        String cpf = (String) request.get("cpf");
        BigDecimal amount = new BigDecimal(request.get("amount").toString());

        Map<String, Object> response = paymentService.createPixPayment(orderId, email, cpf, amount);
        return ResponseEntity.ok(response);
    }
}
