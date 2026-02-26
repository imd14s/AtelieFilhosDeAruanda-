package com.atelie.ecommerce.application.dto.shipping;

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
        private UUID variantId;
        private Integer quantity;
        private BigDecimal weight;
        private BigDecimal length;
        private BigDecimal height;
        private BigDecimal width;

        public UUID getProductId() {
            return productId;
        }

        public void setProductId(UUID productId) {
            this.productId = productId;
        }

        public UUID getVariantId() {
            return variantId;
        }

        public void setVariantId(UUID variantId) {
            this.variantId = variantId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public BigDecimal getWeight() {
            return weight;
        }

        public void setWeight(BigDecimal weight) {
            this.weight = weight;
        }

        public BigDecimal getLength() {
            return length;
        }

        public void setLength(BigDecimal length) {
            this.length = length;
        }

        public BigDecimal getHeight() {
            return height;
        }

        public void setHeight(BigDecimal height) {
            this.height = height;
        }

        public BigDecimal getWidth() {
            return width;
        }

        public void setWidth(BigDecimal width) {
            this.width = width;
        }
    }
}
