package com.atelie.ecommerce.infrastructure.service.fiscal.ncm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record BrasilApiNcmDto(
        @JsonProperty("codigo") String codigo,
        @JsonProperty("descricao") String descricao) {
}
