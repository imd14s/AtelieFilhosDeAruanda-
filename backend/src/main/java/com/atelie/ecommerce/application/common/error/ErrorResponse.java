package com.atelie.ecommerce.application.common.error;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * ErrorResponse.
 *
 * Modelo padrão de resposta de erro da API.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private final OffsetDateTime timestamp;
    private final int status;
    private final String error;
    private final String message;
    private final String path;
    private final Map<String, String> fields;

    /**
     * Constrói um ErrorResponse.
     *
     * @param status  status HTTP numérico
     * @param error   nome curto do erro (ex: "Bad Request")
     * @param message mensagem humana do erro
     * @param path    caminho da requisição
     * @param fields  mapa de erros por campo (opcional)
     */
    public ErrorResponse(int status, String error, String message, String path, Map<String, String> fields) {
        this.timestamp = OffsetDateTime.now();
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
        this.fields = fields;
    }

    /**
     * Cria resposta 400 (Bad Request) opcionalmente com erros por campo.
     *
     * @param message mensagem humana
     * @param path    rota solicitada
     * @param fields  erros por campo (pode ser null)
     * @return ErrorResponse 400
     */
    public static ErrorResponse badRequest(String message, String path, Map<String, String> fields) {
        return new ErrorResponse(400, "Bad Request", message, path, fields);
    }

    /**
     * Cria resposta 401 (Unauthorized).
     *
     * @param message mensagem humana
     * @param path    rota solicitada
     * @return ErrorResponse 401
     */
    public static ErrorResponse unauthorized(String message, String path) {
        return new ErrorResponse(401, "Unauthorized", message, path, null);
    }

    /**
     * Cria resposta 404 (Not Found).
     *
     * @param message mensagem humana
     * @param path    rota solicitada
     * @return ErrorResponse 404
     */
    public static ErrorResponse notFound(String message, String path) {
        return new ErrorResponse(404, "Not Found", message, path, null);
    }

    /**
     * Cria resposta 405 (Method Not Allowed).
     *
     * @param message mensagem humana
     * @param path    rota solicitada
     * @return ErrorResponse 405
     */
    public static ErrorResponse methodNotAllowed(String message, String path) {
        return new ErrorResponse(405, "Method Not Allowed", message, path, null);
    }

    /**
     * Cria resposta 409 (Conflict).
     *
     * @param message mensagem humana
     * @param path    rota solicitada
     * @return ErrorResponse 409
     */
    public static ErrorResponse conflict(String message, String path) {
        return new ErrorResponse(409, "Conflict", message, path, null);
    }

    /**
     * Cria resposta 500 (Internal Server Error).
     *
     * @param message mensagem humana
     * @param path    rota solicitada
     * @return ErrorResponse 500
     */
    public static ErrorResponse internalServerError(String message, String path) {
        return new ErrorResponse(500, "Internal Server Error", message, path, null);
    }

    public OffsetDateTime getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getError() {
        return error;
    }

    public String getMessage() {
        return message;
    }

    public String getPath() {
        return path;
    }

    public Map<String, String> getFields() {
        return fields;
    }
}
