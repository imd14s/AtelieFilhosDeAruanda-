package com.atelie.ecommerce.application.service.payment;

import com.atelie.ecommerce.api.serviceengine.ServiceOrchestrator;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.UUID;

class PaymentServiceTest {

    // Mockamos a dependência complexa
    private final ServiceOrchestrator orchestrator = Mockito.mock(ServiceOrchestrator.class);
    
    // Injetamos no construtor correto
    private final PaymentService paymentService = new PaymentService(orchestrator);

    @Test
    void shouldValidateAmount() {
        RuntimeException exception = Assertions.assertThrows(RuntimeException.class, () -> {
            paymentService.createPixPayment(UUID.randomUUID(), "test@test.com", "12345678900", BigDecimal.ZERO);
        });
        Assertions.assertEquals("Valor do pagamento deve ser maior que zero", exception.getMessage());
    }
}
