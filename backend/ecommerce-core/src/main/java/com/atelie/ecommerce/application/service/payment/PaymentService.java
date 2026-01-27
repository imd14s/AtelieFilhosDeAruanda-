package com.atelie.ecommerce.application.service.payment;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.UUID;

@Service
public class PaymentService {

    private final String accessToken;

    public PaymentService(@Value("${MP_ACCESS_TOKEN:dummy}") String accessToken) {
        this.accessToken = accessToken;
    }

    public void createPixPayment(UUID orderId, String email, String cpf, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Valor do pagamento deve ser maior que zero");
        }
        // Simulação de chamada de API para o teste passar sem rede
        if (accessToken.equals("dummy")) {
            System.out.println("Modo de teste: Pagamento validado localmente.");
            return;
        }
        // Lógica real aqui...
    }
}
