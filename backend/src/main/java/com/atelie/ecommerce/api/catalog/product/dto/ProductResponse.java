package com.atelie.ecommerce.api.catalog.product.dto;

import java.math.BigDecimal;
import java.util.UUID;
import com.atelie.ecommerce.domain.catalog.product.ProductionType;
import com.atelie.ecommerce.domain.catalog.product.ProductOrigin;

public class ProductResponse {

    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private UUID categoryId;
    private Boolean active;
    private String imageUrl;
    private BigDecimal originalPrice;
    private Integer discountPercentage;
    private String ncm;
    private ProductionType productionType;
    private ProductOrigin origin;

    public ProductResponse(UUID id, String name, String description, BigDecimal price, UUID categoryId,
            Boolean active) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.categoryId = categoryId;
        this.active = active;
        this.productionType = ProductionType.REVENDA;
        this.origin = ProductOrigin.NACIONAL;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public UUID getCategoryId() {
        return categoryId;
    }

    public Boolean getActive() {
        return active;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getDiscountPercentage() {
        return discountPercentage;
    }

    public void setDiscountPercentage(Integer discountPercentage) {
        this.discountPercentage = discountPercentage;
    }

    public BigDecimal getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(BigDecimal originalPrice) {
        this.originalPrice = originalPrice;
    }

    public String getNcm() {
        return ncm;
    }

    public void setNcm(String ncm) {
        this.ncm = ncm;
    }

    public ProductionType getProductionType() {
        return productionType;
    }

    public void setProductionType(ProductionType productionType) {
        this.productionType = productionType;
    }

    public ProductOrigin getOrigin() {
        return origin;
    }

    public void setOrigin(ProductOrigin origin) {
        this.origin = origin;
    }
}
