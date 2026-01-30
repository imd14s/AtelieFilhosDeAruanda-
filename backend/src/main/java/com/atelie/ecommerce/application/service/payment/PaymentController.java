package com.atelie.ecommerce.application.service.payment;

import com.atelie.ecommerce.api.payment.dto.PaymentResponse;
import com.atelie.ecommerce.application.service.payment.dto.CreatePixPaymentRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/pix")
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody CreatePixPaymentRequest req) {
        PaymentResponse response = paymentService.createPixPayment(
                req.orderId(),
                req.email(),
                req.cpf(),
                req.amount()
        );
        return ResponseEntity.ok(response);
    }
}
