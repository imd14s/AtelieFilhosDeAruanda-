package com.atelie.ecommerce.application.service.payment;

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

    public Map<String, Object> createPixPayment(UUID orderId, String email, String cpf, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Valor do pagamento deve ser maior que zero");
        }

        // Monta o contexto para o motor de regras
        Map<String, Object> request = new HashMap<>();
        request.put("orderId", orderId.toString());
        request.put("email", email);
        request.put("cpf", cpf);
        request.put("amount", amount);
        request.put("method", "PIX"); 

        // O Motor decide qual provedor usar (Mercado Pago, Pagar.me, Webhook, etc)
        // baseado nas regras do Dashboard (ex: "Acima de R00 usa Pagar.me")
        ServiceResult result = orchestrator.execute(ServiceType.PAYMENT, request, activeProfile);

        if (!result.success()) {
            throw new RuntimeException("Falha no pagamento: " + result.payload().getOrDefault("error", "Erro desconhecido"));
        }

        return result.payload();
    }
}
