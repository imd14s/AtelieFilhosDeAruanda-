package com.atelie.ecommerce.application.service.catalog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeoMetadataDTO {
    private String title;
    private String description;
    private String keywords;
    private String canonicalUrl;
    private String ogTitle;
    private String ogDescription;
    private String ogImage;
    private String ogType;
    private String twitterCard;
}
