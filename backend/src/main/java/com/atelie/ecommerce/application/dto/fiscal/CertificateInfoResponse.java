package com.atelie.ecommerce.application.dto.fiscal;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificateInfoResponse {
    private String subjectName;
    private String expirationDate;
    private String issuerName;

    @JsonProperty("isValid")
    private boolean isValid;
}
