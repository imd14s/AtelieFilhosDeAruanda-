package com.atelie.ecommerce.application.service.payment;

import com.atelie.ecommerce.api.payment.dto.PaymentResponse;
import com.atelie.ecommerce.api.serviceengine.ServiceOrchestrator;
import com.atelie.ecommerce.api.serviceengine.ServiceResult;
import com.atelie.ecommerce.application.service.payment.dto.CreatePixPaymentRequest;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    private final ServiceOrchestrator orchestrator;

    public PaymentService(ServiceOrchestrator orchestrator) {
        this.orchestrator = orchestrator;
    }

    public PaymentResponse createPixPayment(UUID orderId, String customerName, String customerEmail,
            BigDecimal amount) {

        Map<String, Object> request = new HashMap<>();
        request.put("orderId", orderId.toString());
        request.put("customerName", customerName);
        request.put("email", customerEmail);
        request.put("amount", amount);
        request.put("payment_method", "pix");

        ServiceResult result = orchestrator.execute(ServiceType.PAYMENT, request, "dev");

        if (!result.success()) {
            throw new RuntimeException("Falha ao processar pagamento com " + result.providerCode() + ": "
                    + result.payload().get("message"));
        }

        return new PaymentResponse(
                (String) result.payload().getOrDefault("status", "pending"),
                result.providerCode(),
                amount,
                true, // Defaulting to sandbox for dev branch as discussed
                result.payload());
    }

    public PaymentResponse createPixPayment(CreatePixPaymentRequest req) {
        return createPixPayment(req.orderId(), "Cliente", req.email(), req.amount());
    }
}
