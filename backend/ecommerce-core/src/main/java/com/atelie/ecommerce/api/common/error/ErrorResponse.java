package com.atelie.ecommerce.api.common.error;

import java.time.OffsetDateTime;

/**
 * DTO - ErrorResponse (contrato padrão de erro da API)
 *
 * Objetivo:
 * - Padronizar erros para frontend, n8n e integrações.
 *
 * Contrato:
 * - timestamp: data/hora do erro
 * - status: HTTP status code
 * - code: código interno (ex: AUTH_INVALID_CREDENTIALS)
 * - message: mensagem resumida
 * - path: rota que gerou o erro
 */
public class ErrorResponse {

    private OffsetDateTime timestamp;
    private int status;
    private String code;
    private String message;
    private String path;

    public ErrorResponse() {}

    public ErrorResponse(OffsetDateTime timestamp, int status, String code, String message, String path) {
        this.timestamp = timestamp;
        this.status = status;
        this.code = code;
        this.message = message;
        this.path = path;
    }

    public OffsetDateTime getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public String getPath() {
        return path;
    }
}
