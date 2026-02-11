package com.atelie.ecommerce.api.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Resposta de erro padronizada seguindo RFC 7807 (Problem Details for HTTP
 * APIs).
 * 
 * Usado por todos os endpoints para retornar erros de forma consistente.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    /**
     * URI que identifica o tipo de problema.
     * Exemplo: "about:blank" para erros genéricos
     */
    private String type;

    /**
     * Título curto e legível do problema.
     * Exemplo: "Validação Falhou"
     */
    private String title;

    /**
     * Código de status HTTP.
     * Exemplo: 400, 404, 409, 500
     */
    private int status;

    /**
     * Explicação detalhada do problema.
     * Exemplo: "O campo 'nome' é obrigatório"
     */
    private String detail;

    /**
     * URI da requisição que causou o erro.
     * Exemplo: "/api/categories"
     */
    private String instance;

    /**
     * Timestamp do erro.
     */
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    /**
     * Mapa de erros de validação (campo -> mensagem).
     * Usado para erros 400 com múltiplos campos inválidos.
     */
    private Map<String, String> errors;
}
