package com.atelie.ecommerce.application.service.payment;

import com.atelie.ecommerce.api.payment.dto.PaymentResponse;
import com.atelie.ecommerce.api.serviceengine.ServiceOrchestrator;
import com.atelie.ecommerce.api.serviceengine.ServiceResult;
import com.atelie.ecommerce.domain.service.model.ServiceType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    private final ServiceOrchestrator orchestrator;

    @Value("${spring.profiles.active:prod}")
    private String activeProfile;

    public PaymentService(ServiceOrchestrator orchestrator) {
        this.orchestrator = orchestrator;
    }

    public PaymentResponse createPixPayment(UUID orderId, String email, String cpf, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Valor do pagamento deve ser maior que zero");
        }

        Map<String, Object> request = new HashMap<>();
        request.put("orderId", orderId.toString());
        request.put("email", email);
        request.put("cpf", cpf);
        request.put("amount", amount);
        request.put("method", "PIX");

        ServiceResult result = orchestrator.execute(ServiceType.PAYMENT, request, activeProfile);

        if (!result.success()) {
            throw new RuntimeException("Falha no pagamento: " + result.payload().getOrDefault("error", "Erro desconhecido"));
        }

        Map<String, Object> payload = result.payload();
        
        return new PaymentResponse(
            (String) payload.getOrDefault("status", "UNKNOWN"),
            (String) payload.getOrDefault("provider", "UNKNOWN"),
            amount,
            Boolean.TRUE.equals(payload.get("sandbox")),
            payload
        );
    }
}
