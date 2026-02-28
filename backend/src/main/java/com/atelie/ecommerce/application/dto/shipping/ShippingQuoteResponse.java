package com.atelie.ecommerce.application.dto.shipping;

import java.math.BigDecimal;

public class ShippingQuoteResponse {

    private String provider;
    private boolean eligible;
    private boolean freeShippingApplied;
    private BigDecimal shippingCost;
    private BigDecimal freeShippingThreshold;
    private String appliedRuleName;
    private BigDecimal originalShippingCost;
    private String persuasiveMessage;
    private String estimatedDays;

    public ShippingQuoteResponse() {
    }

    public ShippingQuoteResponse(String provider, boolean eligible, boolean freeShippingApplied,
            BigDecimal shippingCost, BigDecimal freeShippingThreshold) {
        this.provider = provider;
        this.eligible = eligible;
        this.freeShippingApplied = freeShippingApplied;
        this.shippingCost = shippingCost;
        this.freeShippingThreshold = freeShippingThreshold;
    }

    public ShippingQuoteResponse(String provider, boolean eligible, boolean freeShippingApplied,
            BigDecimal shippingCost, BigDecimal freeShippingThreshold, String appliedRuleName,
            BigDecimal originalShippingCost, String persuasiveMessage, String estimatedDays) {
        this.provider = provider;
        this.eligible = eligible;
        this.freeShippingApplied = freeShippingApplied;
        this.shippingCost = shippingCost;
        this.freeShippingThreshold = freeShippingThreshold;
        this.appliedRuleName = appliedRuleName;
        this.originalShippingCost = originalShippingCost;
        this.persuasiveMessage = persuasiveMessage;
        this.estimatedDays = estimatedDays;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public boolean isEligible() {
        return eligible;
    }

    public void setEligible(boolean eligible) {
        this.eligible = eligible;
    }

    public boolean isFreeShippingApplied() {
        return freeShippingApplied;
    }

    public void setFreeShippingApplied(boolean freeShippingApplied) {
        this.freeShippingApplied = freeShippingApplied;
    }

    public BigDecimal getShippingCost() {
        return shippingCost;
    }

    public void setShippingCost(BigDecimal shippingCost) {
        this.shippingCost = shippingCost;
    }

    public BigDecimal getFreeShippingThreshold() {
        return freeShippingThreshold;
    }

    public void setFreeShippingThreshold(BigDecimal freeShippingThreshold) {
        this.freeShippingThreshold = freeShippingThreshold;
    }

    public String getAppliedRuleName() {
        return appliedRuleName;
    }

    public void setAppliedRuleName(String appliedRuleName) {
        this.appliedRuleName = appliedRuleName;
    }

    public BigDecimal getOriginalShippingCost() {
        return originalShippingCost;
    }

    public void setOriginalShippingCost(BigDecimal originalShippingCost) {
        this.originalShippingCost = originalShippingCost;
    }

    public String getPersuasiveMessage() {
        return persuasiveMessage;
    }

    public void setPersuasiveMessage(String persuasiveMessage) {
        this.persuasiveMessage = persuasiveMessage;
    }

    public String getEstimatedDays() {
        return estimatedDays;
    }

    public void setEstimatedDays(String estimatedDays) {
        this.estimatedDays = estimatedDays;
    }
}
