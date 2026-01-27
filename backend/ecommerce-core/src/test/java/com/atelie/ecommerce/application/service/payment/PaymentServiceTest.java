package com.atelie.ecommerce.application.service.payment;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;

class PaymentServiceTest {

    private final PaymentService paymentService = new PaymentService("test_token");

    @Test
    void shouldValidateAmount() {
        RuntimeException exception = Assertions.assertThrows(RuntimeException.class, () -> {
            paymentService.createPixPayment(java.util.UUID.randomUUID(), "test@test.com", "12345678900", BigDecimal.ZERO);
        });
        Assertions.assertEquals("Valor do pagamento deve ser maior que zero", exception.getMessage());
    }
}
