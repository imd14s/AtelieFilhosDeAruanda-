package com.atelie.ecommerce.application.service.payment;

import com.atelie.ecommerce.application.dto.payment.PaymentResponse;
import com.atelie.ecommerce.application.serviceengine.ServiceOrchestrator;
import com.atelie.ecommerce.application.serviceengine.ServiceResult;
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
        return processPayment(orderId, customerName, customerEmail, amount, "pix", null, null);
    }

    public PaymentResponse processPayment(UUID orderId, String customerName, String customerEmail,
            BigDecimal amount, String paymentMethod, String paymentToken, String cardId) {

        Map<String, Object> request = new HashMap<>();
        request.put("orderId", orderId.toString());
        request.put("customerName", customerName);
        request.put("email", customerEmail);
        request.put("amount", amount);
        request.put("payment_method", paymentMethod);

        if (paymentToken != null)
            request.put("token", paymentToken);
        if (cardId != null)
            request.put("cardId", cardId);

        ServiceResult result = orchestrator.execute(ServiceType.PAYMENT, request, "PRODUCTION");

        if (!result.success()) {
            throw new RuntimeException("Falha ao processar pagamento com " + result.providerCode() + ": "
                    + result.payload().get("message"));
        }

        return new PaymentResponse(
                (String) result.payload().getOrDefault("status", "pending"),
                result.providerCode(),
                amount,
                true,
                result.payload());
    }

    public PaymentResponse createPixPayment(CreatePixPaymentRequest req) {
        return createPixPayment(req.orderId(), "Cliente", req.email(), req.amount());
    }
}
