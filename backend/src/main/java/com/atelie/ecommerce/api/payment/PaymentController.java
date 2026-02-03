package com.atelie.ecommerce.api.payment;

import com.atelie.ecommerce.application.service.payment.PaymentService;
import com.atelie.ecommerce.application.service.payment.dto.CreatePixPaymentRequest;
import com.atelie.ecommerce.api.payment.dto.PaymentResponse;
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
    public ResponseEntity<PaymentResponse> createPixPayment(
            @RequestBody CreatePixPaymentRequest request
    ) {
        return ResponseEntity.ok(paymentService.createPixPayment(request));
    }
}
