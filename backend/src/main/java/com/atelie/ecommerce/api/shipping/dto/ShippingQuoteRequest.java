package com.atelie.ecommerce.api.shipping.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class ShippingQuoteRequest {

    @NotBlank
    private String cep;

    @NotNull
    private BigDecimal subtotal;

    // opcional: força provedor ("J3" ou "FLAT_RATE"). Se null, usa
    // SHIPPING_PROVIDER_MODE.
    private String provider;

    private List<ShippingItem> items;

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public List<ShippingItem> getItems() {
        return items;
    }

    public void setItems(List<ShippingItem> items) {
        this.items = items;
    }

    public static class ShippingItem {
        private UUID productId;
        private Integer quantity;

        public UUID getProductId() {
            return productId;
        }

        public void setProductId(UUID productId) {
            this.productId = productId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}
