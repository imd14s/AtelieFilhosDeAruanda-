package com.atelie.ecommerce.api.shipping.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class ShippingQuoteRequest {

    @NotBlank
    private String cep;

    @NotNull
    private BigDecimal subtotal;

    // opcional: força provedor ("J3" ou "FLAT_RATE"). Se null, usa SHIPPING_PROVIDER_MODE.
    private String provider;

    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
}
