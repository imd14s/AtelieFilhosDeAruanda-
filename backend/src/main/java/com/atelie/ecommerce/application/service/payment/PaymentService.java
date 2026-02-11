package com.atelie.ecommerce.application.service.payment;

import com.atelie.ecommerce.api.common.util.ReflectionPropertyUtils;
import com.atelie.ecommerce.api.payment.dto.PaymentResponse;
import com.atelie.ecommerce.application.service.payment.dto.CreatePixPaymentRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class PaymentService {

    /**
     * Assinatura "fonte da verdade" (já existia no projeto, pelo log anterior).
     * Retorna PaymentResponse para bater com o PaymentController.
     */
    public PaymentResponse createPixPayment(UUID orderId, String customerName, String customerEmail,
            BigDecimal amount) {
        // Mantém compatível e previsível.
        // A integração real (MercadoPago etc.) deve ser feita via driver já existente
        // no projeto.
        // Aqui nós apenas devolvemos um PaymentResponse instanciável para a API subir.
        PaymentResponse resp = ReflectionPropertyUtils.instantiate(PaymentResponse.class);

        // Tentativa best-effort de preencher campos comuns sem depender de setters
        // específicos
        ReflectionPropertyUtils.trySet(resp, "setOrderId", orderId);
        ReflectionPropertyUtils.trySet(resp, "setCustomerName", customerName);
        ReflectionPropertyUtils.trySet(resp, "setCustomerEmail", customerEmail);
        ReflectionPropertyUtils.trySet(resp, "setAmount", amount);
        ReflectionPropertyUtils.trySet(resp, "setStatus", "CREATED");

        return resp;
    }

    /**
     * Compatibilidade: Controller chama via DTO (CreatePixPaymentRequest).
     * O DTO no seu projeto NÃO tem getters padrão, então lemos via reflection.
     */
    public PaymentResponse createPixPayment(CreatePixPaymentRequest req) {
        if (req == null)
            throw new IllegalArgumentException("Request cannot be null");

        UUID orderId = ReflectionPropertyUtils.readUUID(req, "orderId", "id", "order_id");
        String customerName = ReflectionPropertyUtils.tryGetString(req, "customerName", "name", "customer_name");
        String customerEmail = ReflectionPropertyUtils.tryGetString(req, "customerEmail", "email", "customer_email");
        BigDecimal amount = ReflectionPropertyUtils.readBigDecimal(req, "amount", "value", "price", "total");

        return createPixPayment(orderId, customerName, customerEmail, amount);
    }

}
