package com.atelie.ecommerce.application.dto.shipping;

import java.math.BigDecimal;

public class ShippingQuoteResponse {

    private String provider;
    private boolean eligible;
    private boolean freeShippingApplied;
    private BigDecimal shippingCost;
    private BigDecimal freeShippingThreshold;

    public ShippingQuoteResponse() {}

    public ShippingQuoteResponse(String provider, boolean eligible, boolean freeShippingApplied, BigDecimal shippingCost, BigDecimal freeShippingThreshold) {
        this.provider = provider;
        this.eligible = eligible;
        this.freeShippingApplied = freeShippingApplied;
        this.shippingCost = shippingCost;
        this.freeShippingThreshold = freeShippingThreshold;
    }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public boolean isEligible() { return eligible; }
    public void setEligible(boolean eligible) { this.eligible = eligible; }

    public boolean isFreeShippingApplied() { return freeShippingApplied; }
    public void setFreeShippingApplied(boolean freeShippingApplied) { this.freeShippingApplied = freeShippingApplied; }

    public BigDecimal getShippingCost() { return shippingCost; }
    public void setShippingCost(BigDecimal shippingCost) { this.shippingCost = shippingCost; }

    public BigDecimal getFreeShippingThreshold() { return freeShippingThreshold; }
    public void setFreeShippingThreshold(BigDecimal freeShippingThreshold) { this.freeShippingThreshold = freeShippingThreshold; }
}
