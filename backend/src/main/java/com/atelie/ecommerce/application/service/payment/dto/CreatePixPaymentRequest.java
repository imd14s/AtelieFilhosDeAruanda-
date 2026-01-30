package com.atelie.ecommerce.application.service.payment.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record CreatePixPaymentRequest(
        @NotNull UUID orderId,
        @NotBlank @Email String email,
        @NotBlank String cpf,
        @NotNull @Positive BigDecimal amount
) {}
