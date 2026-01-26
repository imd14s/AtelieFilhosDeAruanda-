package com.atelie.ecommerce.api.common.error;

import com.atelie.ecommerce.api.common.exception.ConflictException;
import com.atelie.ecommerce.api.common.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * GlobalExceptionHandler.
 *
 * Padroniza respostas de erro em ErrorResponse.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ErrorResponse handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> fields = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fields.put(fe.getField(), fe.getDefaultMessage());
        }
        return ErrorResponse.badRequest("Validation error", request.getRequestURI(), fields);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ErrorResponse handleMalformedJson(HttpMessageNotReadableException ex, HttpServletRequest request) {
        return ErrorResponse.badRequest("Malformed JSON", request.getRequestURI(), null);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ErrorResponse handleUnauthorized(UnauthorizedException ex, HttpServletRequest request) {
        return ErrorResponse.unauthorized(ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(ConflictException.class)
    public ErrorResponse handleConflict(ConflictException ex, HttpServletRequest request) {
        return ErrorResponse.conflict(ex.getMessage(), request.getRequestURI());
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ErrorResponse handleNotFound(NoHandlerFoundException ex, HttpServletRequest request) {
        return ErrorResponse.notFound("Route not found", request.getRequestURI());
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ErrorResponse handleMethodNotAllowed(HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        return ErrorResponse.methodNotAllowed("Method not allowed", request.getRequestURI());
    }

    @ExceptionHandler(Exception.class)
    public ErrorResponse handleGeneric(Exception ex, HttpServletRequest request) {
        return ErrorResponse.internalServerError("Internal server error", request.getRequestURI());
    }
}
